const { LiveTranscriptionEvents, createClient } = require("@deepgram/sdk");
const { clearWsClient, processResponse, sendUserTranscription } = require("../../utils/Helper");
const {
  deepgramModel,
  deepgramLanguage,
  deepgramInterimResults,
  deepgramUtteranceEndMs,
  deepgramEncoding,
  deepgramSampleRate,
  deepgramPunctuate,
  deepgramEndpointing,
  deepgramApiKeys,
  logGroupName,
  logStreamName,
} = require("../../config/Constants");
const { pushLogEvent } = require("../AWS/CloudWatch");

// Constants for backoff
let activeCallsPerKey = Array(deepgramApiKeys.length).fill(0); // Active Calls per Deepgram API key
const maxCallsPerKey = 38; // Concurrency Limit per Deepgram API key
const baseDelay = 10000; // 15 seconds - base delay when keys are unavailable
const maxDelay = 300000; // 5 mins - max delay for backoff
const maxRetries = 6; // Retries for backoff

// FInd Available api key
function findAvailableApiKey() {
  for (let i = 0; i < deepgramApiKeys.length; i++) {
    if (activeCallsPerKey[i] < maxCallsPerKey) {
      return { key: deepgramApiKeys[i], index: i };
    }
  }
  throw new Error("All API keys are at their concurrency limit.");
}

// Initialize deepgram Client
async function createDeepgramClient(retryCount = 0) {
  const backoffDelay = Math.min(baseDelay * 2 ** retryCount, maxDelay);
  try {
    const { key, index } = findAvailableApiKey();
    activeCallsPerKey[index]++;
    const deepgram = createClient(key);

    return { deepgram, index };
  } catch (err) {
    console.error("Error creating Deepgram connection");

    if (retryCount >= maxRetries) {
      console.error("Max retries reached.");
      throw new Error(err)
    }

    await new Promise((resolve) => {
      setTimeout(resolve, backoffDelay);
    });

    return createDeepgramClient(retryCount + 1);
  }
}

/**
 * Creates a deepgram connection.
 * @param {Websocket Connection} ws - Client for which deepgram connection needs to be created.
 */

async function createDeepgramConnection() {
  try {
    const { deepgram, index } = await createDeepgramClient();
    const deepgramConnection = deepgram.listen.live({
      model: deepgramModel, 
      language: deepgramLanguage,
      interim_results: deepgramInterimResults,
      utterance_end_ms: deepgramUtteranceEndMs,
      // encoding: deepgramEncoding,
      // sample_rate: deepgramSampleRate,
      punctuate: deepgramPunctuate,
      endpointing: deepgramEndpointing,
    });

    return { deepgramConnection, index };
  } catch (err) {
    console.log(err);
    throw new Error("Problem connecting to deepgram");
  }
}

/**
 * Processes deepgram events.
 * @param {Websocket Connection} ws - Client for which deepgram messages need to be processed.
 * @param {Deepgram Connection} deepgramConnection - Deepgram connection which resolves the incoming messages.
 */

function deepgramEvents(ws, deepgramConnection, index) {
  ws.utteranceEndText = "";
  ws.finalResult = "";
  ws.speechFinal = false;
  ws.text = "";
  let keepAliveInterval;

  // On Connection Open
  deepgramConnection.on(LiveTranscriptionEvents.Open, () => {
    console.log("Deepgram connection open");
    ws.send(JSON.stringify('deepgram is active'))
    keepAliveInterval = setInterval(() => {
      deepgramConnection.keepAlive();
    }, 3000);
  });

  // On Connection Close
  deepgramConnection.on(LiveTranscriptionEvents.Close, () => {
    console.log("Deepgram connection closed.");
    clearInterval(keepAliveInterval);
    clearDeepgramConnection(ws, deepgramConnection, index);
  });

  deepgramConnection.on(LiveTranscriptionEvents.Error, (err) => {
    console.error(err);
    clearInterval(keepAliveInterval);
    clearDeepgramConnection(ws, deepgramConnection, index);
  });

  // Transciption
  deepgramConnection.on(LiveTranscriptionEvents.Transcript, async (data) => {
      const alternatives = data.channel?.alternatives;

    // if (data && alternatives[0].transcript !== "") {
    // ws.send(JSON.stringify(alternatives[0].transcript))
    // }
    // console.log(alternatives)
    if (alternatives) {
      ws.text = alternatives[0]?.transcript;
    }
    if (data.is_final === true && ws.text.trim().length > 0) {
      ws.finalResult += `${ws.text} `;
      
      // Sending user transcription to the ws client (back to user)
      // console.log('speech final: ', ws.finalResult)
      
      // if speech_final and is_final that means this text is accurate and it's a natural pause in the speakers speech. We need to send this to the assistant for processing
      if (
        data.speech_final === true &&
        ws.utteranceEndText.trim().length === 0
      ) {
        ws.speechFinal = true; // this will prevent a utterance end which shows up after speechFinal from sending another response
        
        
        // Sending user transcription to the ws client (back to user)
        console.log('speech final: ', ws.finalResult)
        sendUserTranscription(ws,ws.finalResult);
        
        processDeepgramTranscription(ws, "speech final",ws.finalResult);
        ws.finalResult = "";
        ws.text = "";
      } else {
        // if we receive a message without speechFinal reset speechFinal to false, this will allow any subsequent utteranceEnd messages to properly indicate the end of a message
        speechFinal = false;
      }
    }
  });

  deepgramConnection.on(LiveTranscriptionEvents.UtteranceEnd,  async () => {
    ws.utteranceEndText = ws.finalResult;

    console.log('utterance end: ', ws.finalResult)
    if (ws.utteranceEndText.trim().length > 0 && !ws.speechFinal) {
      // Sending user transcription to the ws client (back to user)
      console.log('utterance end: ', ws.finalResult)
      sendUserTranscription(ws,ws.finalResult);

      processDeepgramTranscription(ws, "utterance end", ws.utteranceEndText);

      ws.finalResult = "";
      ws.text = "";
      ws.utteranceEndText = "";
    }
  })
}

/**
 * Processes transcript received from deepgram.
 * @param {Websocket Connection} ws - Client for which deepgram messages need to be processed.
 * @param {String} sectionName - Section from which deepgram transcript was received.
 * @param {String} transcription - The transcript message received from Deepgram.
 */

function processDeepgramTranscription(ws, sectionName, transcription) {
  try {
    ws.sessionData.isInterupptionDetected = true;
    clearWsClient(ws); // Send a clear event to twilio for the ws clients
    console.log(
      `Transcribed output from ${sectionName} section - ${transcription}`
    );
    processResponse(ws, transcription, sectionName);
  } catch (err) {
    console.log(err);
    // Pushing error to cloudwatch
    // pushLogEvent(
    //   logGroupName,
    //   logStreamName,
    //   `CallSID: ${ws.sessionData.callSid}, error: ${err}`
    // );
  }
}

// Close all connections and cleanup variables
function clearDeepgramConnection(ws, deepgramConnection, index) {
  activeCallsPerKey[index]--;

  if (deepgramConnection) {
    deepgramConnection.finish();
  }

  if (ws.sessionData) ws.sessionData = null;
  ws.utteranceEndText = null;
  ws.finalResult = null;
  ws.speechFinal = null;
  ws.text = null;
}

module.exports = {
  createDeepgramConnection,
  deepgramEvents,
};
