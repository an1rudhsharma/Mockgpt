require("dotenv").config();
const AWS = require("aws-sdk");
const {
  pollyEngine,
  pollyOutputFormat,
  pollyVoiceId,
  pollySampleRate,
} = require("../../config/Constants");

const polly = new AWS.Polly({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**
 * Used to convert a given text to speech using Amazon Polly.
 * @param {string} text - The message content for which speech needs to be generated.
 */

async function getPollyStreams(text) {
  const params = {
    Engine: pollyEngine,
    // OutputFormat: pollyOutputFormat, // Audio format (e.g., mp3, ogg_vorbis, pcm)
    OutputFormat: 'mp3', // Audio format (e.g., mp3, ogg_vorbis, pcm)
    Text: text, // Text to synthesize
    VoiceId: pollyVoiceId, // Polly voice (e.g., Joanna, Matthew)
    // SampleRate: pollySampleRate, // Sample rate in Hz (optional)
  };

  try {
    // Call Polly's synthesizeSpeech method
    const data = await polly.synthesizeSpeech(params).promise();

    return data.AudioStream;
  } catch (error) {
    console.log(error);
    throw new Error("AWS Polly Error");
  }
}

module.exports = { getPollyStreams };
