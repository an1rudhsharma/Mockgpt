// Deepgram API Keys
const deepgramApiKeys = [
  process.env.DEEPGRAM_API_KEY,
  process.env.DEEPGRAM_API_KEY_2,
  process.env.DEEPGRAM_API_KEY_3,
  process.env.DEEPGRAM_API_KEY_4,
  process.env.DEEPGRAM_API_KEY_5,
  process.env.DEEPGRAM_API_KEY_6,
  process.env.DEEPGRAM_API_KEY_7,
  process.env.DEEPGRAM_API_KEY_8,
  process.env.DEEPGRAM_API_KEY_9,
  process.env.DEEPGRAM_API_KEY_10,
];

//Deepgram configs
const deepgramModel = "nova-2";
const deepgramLanguage = "en";
const deepgramInterimResults = true;
const deepgramUtteranceEndMs = 2500;
const deepgramEncoding = "linear16";
const deepgramSampleRate = 16000;
const deepgramPunctuate = true;
const deepgramEndpointing = 200;

//Open AI configs
const openAiModel = "gpt-4o-mini";
const openAiResponseTemperature = 0;

// AWS related configs
const promptBucketName = "mockgpt";
const callOutcomeBucketName = "mockgpt";
const logGroupName = "transcript-log-group";
const logStreamName = "transcript-log-stream";
const pollyEngine = "neural";
const pollyOutputFormat = "pcm";
const pollyVoiceId = "Ruth";
const pollySampleRate = "8000";
const interviewDetailsTableName = "interview_InterviewTable";

module.exports = {
  deepgramApiKeys,
  deepgramModel,
  deepgramLanguage,
  deepgramInterimResults,
  deepgramUtteranceEndMs,
  deepgramEncoding,
  deepgramSampleRate,
  deepgramPunctuate,
  deepgramEndpointing,
  openAiModel,
  openAiResponseTemperature,
  promptBucketName,
  callOutcomeBucketName,
  logGroupName,
  logStreamName,
  pollyEngine,
  pollyOutputFormat,
  pollyVoiceId,
  pollySampleRate,
  interviewDetailsTableName,
};
