const { promptBucketName, greetMessageBucketName, callOutcomeBucketName } = require("./config/Constants");
const { getSessionData, storeSessionData } = require("./data/CallSessionData");
const { createInterviewEntry } = require("./services/AWS/DynamoDB");
const { getObjectFromS3 } = require("./services/AWS/S3");
const { getPollyStreams } = require("./services/Synthesis/Polly");
// const { hangupCall } = require("./services/Telephony/Plivo");
const { deepgramEvents, createDeepgramConnection } = require("./services/Transcribe/Deepgram");
const {
  clearWsClient,
  sendMediaEvent,
  processInterviewOutcome,
  sendTextClient,
} = require("./utils/Helper");
const { v4: uuidv4 } = require('uuid');
/**
 * Initializes websocket to specify actions to be performed.
 * @param {Websocket Connection} wss - The websocket which needs to be initialized.
 */

function initializeWebSocket(wss) {
  wss.on("connection", async function connection(ws,req) {
    const interviewSubject = req.url?.split('/')[1];
    console.log("New Connection Initiated");


    const userId = '43b9ab41-ccec-4371-9966-6a1fccf885de';

    // generating a random uuid for interview 
      let interviewId = uuidv4();
      await makeOutboundCall(userId,interviewId,interviewSubject);

      
      // on Start
      ws.sessionData = initializeSessionData(
        interviewId
    );
    deepgramEvents(
      ws,
      ws.sessionData.deepgramConnection,
      ws.sessionData.index
    );
    console.log(`Starting Media Stream`);
    
    // Start The interview
    ws.interviewStartTime = new Date().toISOString();
    
    // Send InterviewId to client
    const WsOutputEvent = {
      event: "interviewId",
      payload: interviewId
    };
    ws.send(JSON.stringify(WsOutputEvent));
  
    sendGreetMessage(ws.sessionData.greetMessage, ws);
   
    // //Handling websocket messages from clients
    ws.on("message", async function incoming(message) {
      // const msg = Buffer.from(message, "base64")
      console.log('message received')
      // console.log(msg)
      ws.sessionData.deepgramConnection.send(message);
    });

    ws.on("error", function (error) {
      console.error("WebSocket Error:", error);
    });

    ws.on("close", async function (code) {
      // Process Interview Outcome and update to dynamo
      await processInterviewOutcome(ws.sessionData);
      console.log(`Interview Review updated`);

      console.log(`Websocket connection closed: ${code}`);
      // cleanupSocketSession(ws);
    });
  });
}

// CleanUp Web socket session Data
function cleanupSocketSession(ws) {
  if (ws.sessionData) {
    if (ws.sessionData.deepgramConnection) {
      ws.sessionData.deepgramConnection.finish();
      ws.sessionData.deepgramConnection = null;
    }
    ws.sessionData = null;
  }
}

// Inisiating a web socket sessiondata setup
const makeOutboundCall = async (userId,interviewId,interviewSubject) => {
  let interviewType =  interviewSubject.charAt(0).toUpperCase() + interviewSubject.slice(1)
  let promptFileName =  interviewType + '.txt';
  let callOutcomeFileName =  interviewType + 'FeedbackPrompt.txt';

  const promptObjectKey =  promptFileName;
  const callOutcomePromptObjectKey =  callOutcomeFileName;

  try {
    // Fetching client specific prompt
    let prompt = await getObjectFromS3(promptBucketName, promptObjectKey);

     // Fetching client specific callOutcome
     const callOutcomePrompt = await getObjectFromS3(
      callOutcomeBucketName,
      callOutcomePromptObjectKey
    );

    //Creating deepgram connection
    const { deepgramConnection, index } = await createDeepgramConnection();

    setInterval(() => {
      deepgramConnection.keepAlive();
    }, 3000);


    //Storing session specific data
    const currentCallSessionData = {
      userId,
      deepgramConnection,
      prompt,
      greetMessage: `Hello Abhay, How was your day? Lets start with your ${interviewSubject} interview.`,
      callOutcomePrompt,
      index: index,
    };
 
    storeSessionData(interviewId, currentCallSessionData);
    
     // Push Call Details to dynamoDB Phone call Table
     const interviewDetails = {
      userId,
      interviewId,
    };

    createInterviewEntry(interviewDetails);
    return;
  } catch (error) {
    // Pushing error to cloudwatch
    console.log(error);
  }
};



/**
 * Initializes session data for a given websocket client.
 * @param {Websocket Connection} ws - The websocket client for which session data needs to be initialized.
 */

function initializeSessionData(interviewId) {
  const currentCallSessionData = getSessionData(interviewId);
  const sessionData = {
    interviewId: interviewId,
    userId: currentCallSessionData.userId,
    interviewStartTime: null,
    isInterruptionDetected: false,
    currentAssistantMessage: currentCallSessionData.greetMessage,
    deepgramConnection: currentCallSessionData.deepgramConnection,
    messageContent: [
      { role: "system", content: currentCallSessionData.prompt },
    ],
    greetMessage: currentCallSessionData.greetMessage,
    callOutcomePrompt: currentCallSessionData.callOutcomePrompt,
    index: currentCallSessionData.index,
   };

  return sessionData;
}

/**
 * Sends a greet message to a client.
 * @param {Websocket Connection} ws - The websocket client for which we need to send greet message.
 * @param {String} greetMessage - The greet message that needs to be sent.
 */

function sendGreetMessage(greetMessage, ws) {
  sendTextClient(ws,greetMessage)
  getPollyStreams(greetMessage).then((data) => {
    // clearWsClient(ws);
    sendMediaEvent(ws, data);
    // ws.send(data)
  });
}

module.exports = { initializeWebSocket };
