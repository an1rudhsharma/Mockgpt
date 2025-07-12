const { getObjectFromS3 } = require("../services/AWS/S3");
const {
  promptBucketName,
  greetMessageBucketName,
  logGroupName,
  logStreamName,
  callOutcomeBucketName,
} = require("../config/Constants");
const {
  createLogGroup,
  createLogStream,
  pushLogEvent,
} = require("../services/AWS/CloudWatch");
const { createDeepgramConnection } = require("../services/Transcribe/Deepgram");
const {
  storeSessionData,
  getSessionData,
} = require("../data/CallSessionData");
const {
  createCallEntry,
  updateCallDetails,
} = require("../services/AWS/DynamoDB");
const { startPlivoOutgoingCall } = require("../services/Telephony/Plivo");

/**
 * Starts an outbound call.
 * @param {string} req - The request payload from outbound endpoint.
 * @param {object} res - The response payload for outbound endpoint.
 */
const makeOutboundCall = async (req, res) => {
  let callSid;
  const clientId = req.body.clientId;
  const toNumber = req.body.toNumber;
  const numAttempts = req.body.numAttempts;
  const promptFileName = req.body.promptFileName;
  const greetMessageFileName = req.body.greetMessageFileName;
  const callOutcomeFileName = req.body.callOutcomePromptFileName;
  const customerDetails = req.body.customerDetails
  ? req.body.customerDetails
  : null;
  
  //Generating object keys for prompt and greet message
  const promptObjectKey = clientId + "/" + promptFileName;
  const greetMessageObjectKey = clientId + "/" + greetMessageFileName;
  const callOutcomePromptObjectKey = clientId + "/" + callOutcomeFileName;
  
  try {
    // Fetching client specific prompt
    let prompt = await getObjectFromS3(promptBucketName, promptObjectKey);

    //Fetching client specific greet message
    const greetMessage = await getObjectFromS3(
      greetMessageBucketName,
      greetMessageObjectKey
    );

    // Fetching client specific callOutcome
    const callOutcomePrompt = await getObjectFromS3(
      callOutcomeBucketName,
      callOutcomePromptObjectKey
    );

    //Replacing customer details in the prompt
    if (customerDetails != null) {
      Object.entries(customerDetails).forEach(([key, value]) => {
        prompt = prompt.replaceAll(key, value);
      });
    }

    //Creating log group and log stream to capture logs
    createLogGroup(logGroupName);
    createLogStream(logGroupName, logStreamName);

    //Creating deepgram connection
    const { deepgramConnection, index } = await createDeepgramConnection();

    setInterval(() => {
      deepgramConnection.keepAlive();
    }, 3000);

    //Creating call to customer
    callSid = await startPlivoOutgoingCall(toNumber);
   

    //Storing session specific data
    const currentCallSessionData = {
      deepgramConnection: deepgramConnection,
      prompt: prompt,
      greetMessage: greetMessage,
      callOutcomePrompt: callOutcomePrompt,
      index: index,
      clientId: clientId,
    };
    storeSessionData(callSid, currentCallSessionData);

    // Push Call Details to dynamoDB Phone call Table
    const callDetails = {
      clientId,
      callSid,
      toPhoneNumber: toNumber,
      fromPhoneNumber: process.env.PLIVO_PHONE_NUMBER,
      voiceAgentId: null,
      promptId: null,
      greetMessageId: null,
      callOutcomePromptId: null,
      customerDetails,
      numAttempts,
    };

    createCallEntry(callDetails);

    //Sending a response back to calling function
    const response = {
      message: "Call registered successfully!",
    };
    res.send(response);
  } catch (error) {
    // Pushing error to cloudwatch
    if (callSid) {
      pushLogEvent(
        logGroupName,
        logStreamName,
        `CallSid: ${callSid}, error: ${error}`
      );
    } else {
      pushLogEvent(logGroupName, logStreamName, `error: ${error}`);
    }
    console.log(error);
    const response = {
      message: "Failed to initiate the call!",
    };
    res.status(500).send(response);
  }
};

/**
 * Returns an XML response containing details on bidirectional stream setup.
 * @param {string} req - The request payload for plivoResponse endpoint.
 * @param {object} res - The response payload for plivoResponse endpoint.
 */
const plivoResponse = (req, res) => {
  res.set("Content-Type", "text/xml");

  res.send(`
      <Response>
       <Record action="https://${req.headers.host}/record" recordSession="true" redirect="false" maxLength="3600" />
        <Stream streamTimeout="3600" keepCallAlive="true" bidirectional="true" contentType="audio/x-l16;rate=16000">
         wss://${req.headers.host}/
         </Stream>
      </Response>
  `);
};

/**
 * Returns a record object.
 * @param {string} req - The request payload from outbound endpoint.
 * @param {object} res - The response payload for outbound endpoint.
 */
const recordingCallback = async (req, res) => {
  const callSid = req.body.CallUUID;
  const clientId = getSessionData(callSid).clientId;

  const callDetails = {
    clientId,
    recordingLink: req.body.RecordUrl,
    recordingSid: req.body.RequestUUID,
    recordingId: req.body.RecordingID,
  };

  try {
    await updateCallDetails(callSid, callDetails);
    console.log("Recording details updated");
  } catch (error) {
    console.error("Error updating recording details");
    // Pushing error to cloudwatch
    pushLogEvent(
      logGroupName,
      logStreamName,
      `CallSID: ${callSid}, error: ${error}`
    );
  }
};

/**
 * Stores session data for a given callSID.
 * @param {string} req - The request payload for callback endpoint.
 * @param {object} res - The response payload for callback endpoint.
 */
const hangupCallback = async (req, res) => {
  const callSid = req.body.CallUUID;
  const callStatus = req.body.CallStatus;
  const hangupCode = req.body.HangupCauseCode;
  const clientId = getSessionData(callSid).clientId;

  let callDetails;
  try {
    // If user rejected the call (busy) or didn't pick (no-answer)
    if (hangupCode === "3010" || hangupCode === "3000") {
      const message =
        hangupCode == "3010" ? "Call was Rejected." : "Call not answered";

      callDetails = {
        clientId,
        callStatus: callStatus,
      };

      await updateCallDetails(callSid, callDetails);
      console.log(message);
    }
    // In case of normal hangup by user
    else if (hangupCode == "4000") {
      callDetails = {
        clientId,
        callStatus: callStatus,
        callDuration: req.body.Duration,
        startTime: req.body.StartTime,
        endTime: req.body.EndTime,
      };

      await updateCallDetails(callSid, callDetails);
      console.log("Call has completed");
    }

    // deleteSessionData(callSid); // Delete session data of the call
  } catch (error) {
    console.error(error);
    // Pushing error to cloudwatch
    pushLogEvent(
      logGroupName,
      logStreamName,
      `CallSID: ${callSid}, error: ${error}`
    );
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = {
  makeOutboundCall,
  plivoResponse,
  recordingCallback,
  hangupCallback,
};
