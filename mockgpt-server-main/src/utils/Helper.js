const { logGroupName, logStreamName } = require("../config/Constants");
const { pushLogEvent } = require("../services/AWS/CloudWatch");
const { updateInterviewDetails } = require("../services/AWS/DynamoDB");
const {
  streamingChatCompletions,
  chatCompletions,
} = require("../services/LLM/OpenAI");
const { getPollyStreams } = require("../services/Synthesis/Polly");

// Sleep Function
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


/**  Sends a media event for a given websocket client.
* @param {Websocket Connection} ws - Client for which the media event needs to be sent.
* @param {Audio Buffer} data - Audio Buffer data that needs to be sent to the client.
*/
function sendTextClient(ws,text) {
  const twilioOutputEvent = {
    event: "text",
    media: {
      payload: text
    }
    // streamSid: ws.sessionData.streamSID,
  };
  ws.send(JSON.stringify(twilioOutputEvent));
}

/**  Sends a media event for a given websocket client.
* @param {Websocket Connection} ws - Client for which the media event needs to be sent.
* @param {Audio Buffer} data - Audio Buffer data that needs to be sent to the client.
*/
function sendUserTranscription(ws,text) {
  const twilioOutputEvent = {
    event: "user",
    media: {
      payload: text
    }
    // streamSid: ws.sessionData.streamSID,
  };
  ws.send(JSON.stringify(twilioOutputEvent));
}

/**  Sends a media event for a given websocket client.
* @param {Websocket Connection} ws - Client for which the media event needs to be sent.
* @param {Audio Buffer} data - Audio Buffer data that needs to be sent to the client.
*/
function clearWsClient(ws) {
  const twilioOutputEvent = {
    event: "clear",
    // streamSid: ws.sessionData.streamSID,
  };
  ws.send(JSON.stringify(twilioOutputEvent));
}

/* Sends a media event for a given websocket client.
* @param {Websocket Connection} ws - Client for which the media event needs to be sent.
* @param {Audio Buffer} data - Audio Buffer data that needs to be sent to the client.
*/
function sendMediaEvent(ws, data) {
  const plivoOutputEvent = {
    event: "playAudio",
    media: {
      contentType: "audio/mpeg",
      sampleRate: 8000,
      payload: data.toString("base64"),
    },
  };
  ws.send(JSON.stringify(plivoOutputEvent));
}

/**
 * Processes transcript received from deepgram and generate response through Open AI.
 * @param {Websocket Connection} ws - Client for which deepgram messages need to be processed.
 * @param {String} content - The transcript message received from Deepgram.
 * @param {String} sectionName - Section from which deepgram transcript was received.
 */

// Process Response
async function processResponse(ws, content, sectionName) {
  try {
    ws.sessionData.messageContent.push({
      role: "assistant",
      content: ws.sessionData.currentAssistantMessage,
    });
    ws.sessionData.messageContent.push({ role: "user", content: content });
    ws.accumulatedText = "";
    await sleep(1000);
    ws.sessionData.isInterupptionDetected = false;
    ws.sessionData.currentAssistantMessage = "";
   
    await streamingChatCompletions(
      ws.sessionData.callSID,
      ws.sessionData.messageContent,
      async (chunk) => {
        try {
          if (
            chunk.choices[0].delta.content &&
            chunk.choices[0].delta.content.length > 0
          ) {
            if (ws.sessionData && ws.sessionData.isInterupptionDetected) {
              clearWsClient(ws);
              return true;
            }
            ws.accumulatedText += chunk.choices[0].delta.content;
            const punctuationRegex = /[.?!।]/;
            const match = ws.accumulatedText.match(punctuationRegex);
            if (match) {
              sendTextClient( ws, ws.accumulatedText.substring(0, match.index + 1))
              await openAIToPolly(
                ws.accumulatedText.substring(0, match.index + 1),
                ws
              );
              ws.accumulatedText =
              match.index + 1 > ws.accumulatedText.length
              ? ""
              : ws.accumulatedText.substring(match.index + 1);
              
            }
          }
          return false;
        } catch (error) {
          console.log(error);
          // Pushing error to cloudwatch
          pushLogEvent(
            logGroupName,
            logStreamName,
            `CallSID: ${ws.sessionData.callSid}, error: ${error}`
          );
        }
      }
    );
    console.log(
      `Open AI message from ${sectionName} section - ${ws.sessionData?.currentAssistantMessage}`
    );
  } catch (err) {
    console.log(err);
    // Pushing error to cloudwatch
    pushLogEvent(
      logGroupName,
      logStreamName,
      `CallSID: ${ws.sessionData.callSid}, error: ${err}`
    );
  }
}

/**
 * Convert output from Open AI to speech and send back to Telephony.
 * @param {Websocket Connection} ws - Client for which deepgram messages need to be processed.
 * @param {String} message - The message which needs to be converted to speech and sent back to Telephony.
*/

// Sending Open AI response to Polly
async function openAIToPolly(message, ws) {
  try {
    const index = message.indexOf("[Cut the call]");
    if (index !== -1) {
      message = message.substring(0, index - 1);
      sendCheckPointEvent(ws); // Hangup call if [Cut the call] present
    }
   
    const data = await getPollyStreams(message);
    
    sendMediaEvent(ws, data);
    
    // for (let xx = 0; xx < data.length; xx += 10) {
    //   if (ws.sessionData && ws.sessionData.isInterupptionDetected) {
    //     clearWsClient(ws);
    //     break;
    //   }
    //   const chunk = data.slice(xx, xx + 10);
      
    //   console.log('444444444444')
    //   sendMediaEvent(ws, data);
    // }

    if (ws.sessionData && !ws.sessionData.isInterupptionDetected) {
      ws.sessionData.currentAssistantMessage += message;
    }
  } catch (error) {
    console.log(error);
    // Pushing error to cloudwatch
    pushLogEvent(
      logGroupName,
      logStreamName,
      `CallSID: ${ws.sessionData.callSid}, error: ${error}`
    );
  }
}

// Get Call Outcome
async function getCallOutcome(conversationDetail, callOutcomePrompt) {
  // const newDate = new Date().toISOString().split("T");
  // const currentDate = newDate[0];
  // const currentTime = newDate[1].split(".")[0];
  // Replacing date and time in outcome prompt
  // callOutcomePrompt = callOutcomePrompt.replaceAll(
  //   "[Current_Date]",
  //   currentDate
  // );
  // callOutcomePrompt = callOutcomePrompt.replaceAll(
  //   "[Current_Time]",
  //   currentTime
  // );

  const messageContent = [
    { role: "user", content: conversationDetail },
    { role: "system", content: callOutcomePrompt },
  ];

  return chatCompletions(messageContent)
    .then((message) => {
      console.log("Open AI call outcome - " + message);
      return message;
    })
    .catch((error) => {
      console.error("Error determining call outcome:", error);
      return "Unable to determine outcome";
    });
}

// Process Call Outcome and update to dynamo
async function processInterviewOutcome(data) {
  try {
    let j;
    let conversationTranscript = "";
    let interviewId = data.interviewId;
    let userId = data.userId;
    let callOutcomePrompt = data.callOutcomePrompt;
    let messageContent = data.messageContent;

    for (j = 0; j < messageContent.length; j++) {
      if (messageContent[j].role !== "system")
        conversationTranscript += `${messageContent[j].role}: ${messageContent[j].content},`;
    }
    
    let callOutcome = null;
    if(conversationTranscript){
       callOutcome = await getCallOutcome(
        conversationTranscript,
        callOutcomePrompt
      );
    }

    // Update Interview details after call ends
    const interviewDetails = {
      userId,
      conversationTranscript,
      callOutcome,
    };
    await updateInterviewDetails(interviewId, interviewDetails);
    return;
  } catch (error) {
    console.log(error);
    // Pushing error to cloudwatch
    pushLogEvent(
      logGroupName,
      logStreamName,
      `CallSID: ${data.callSID}, error: ${error}`
    );
  }
}

module.exports = {
  sleep,
  clearWsClient,
  sendTextClient,
  sendMediaEvent,
  sendUserTranscription,
  processResponse,
  openAIToPolly,
  getCallOutcome,
  processInterviewOutcome,
};
