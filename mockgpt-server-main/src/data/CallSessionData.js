const callSessionMap = new Map();

/**
 * Stores session data for a given callSID.
 * @param {string} callSID - The unique identifier for the call session.
 * @param {object} sessionData - The data to store, containing deepgramConnection, prompt, and greetMessage.
 */
function storeSessionData(callSID, sessionData) {
  if (!callSID) {
    throw new Error('CallSID is required to store session data.');
  }
  if (!sessionData || typeof sessionData !== 'object') {
    throw new Error('Session Data must be an object containing the session data.');
  }
  callSessionMap.set(callSID, sessionData);
}

/**
 * Retrieves session data for a given callSID.
 * @param {string} callSID - The unique identifier for the call session.
 * @returns {object|null} - The stored session data or null if not found.
 */
function getSessionData(callSID) {
  if (!callSID) {
    throw new Error('CallSID is required to retrieve session data.');
  }
  return callSessionMap.get(callSID) || null;
}

/**
 * Deletes session data for a given callSID.
 * @param {string} callSID - The unique identifier for the call session.
 */
function deleteSessionData(callSID) {
  if (!callSID) {
    throw new Error('CallSID is required to delete session data.');
  }
  callSessionMap.delete(callSID);
}

module.exports = {
  storeSessionData,
  getSessionData,
  deleteSessionData,
};
