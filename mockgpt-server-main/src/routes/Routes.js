const express = require("express");
const {
  makeOutboundCall,
  plivoResponse,
  recordingCallback,
  hangupCallback,
} = require("../controllers");
const router = express.Router();

/**
 * Route for creating an outbound call.
 */
router.post("/outbound", makeOutboundCall);

/**
 * Route to return an XML response containing details on bidirectional stream setup.
 */
router.get("/", plivoResponse);

/**
 * Route for Plivo return record call object
 */
router.post("/record", recordingCallback);

/**
 * Route for hangup endpoint to update dynamo DB after an outbound call.
 */
router.post("/hangup", hangupCallback);

module.exports = router;
