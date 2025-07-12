// import { Captions } from "@/interfaces/types";

export const base64ToArrayBuffer = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};

// export const playNextInQueue = async (
//     audioContext: AudioContext,
//     audioQueueRef: React.MutableRefObject<string[]>,
//     transcript: string[],
//     isPlayingRef: React.MutableRefObject<boolean>,
//     currentAudioSourceRef: React.MutableRefObject<AudioBufferSourceNode | null>,
//     setCaptions: React.Dispatch<React.SetStateAction<Captions[]>>
// ) => {
//     if (audioQueueRef.current.length === 0 || isPlayingRef.current) {
//         return;
//     };

//     const audioData = audioQueueRef.current.shift()!;
//     let transcriptText = transcript.shift() as string;

//     isPlayingRef.current = true;

//     try {
//         const arrayBuffer = base64ToArrayBuffer(audioData);
//         const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

//         const source = audioContext.createBufferSource();
//         source.buffer = audioBuffer;

//         if (transcriptText) {
//             setCaptions((prev) => {
//                 const lastMessage = prev[prev.length - 1]
//                 let newArr;

//                 //  If the last message is of interviewer append in it else add a new user message
//                 if (lastMessage && lastMessage.sender !== 'user') {
//                     prev.pop();
//                     newArr = [...prev, {
//                         id: lastMessage.id,
//                         sender: lastMessage.sender,
//                         text: lastMessage.text + transcriptText,
//                         timestamp: lastMessage.timestamp
//                     }]
//                 } else {
//                     newArr = [...prev, {
//                         id: Math.ceil(Math.random() * 1000),
//                         sender: "Alex",
//                         text: transcriptText,
//                         timestamp: new Date()
//                     }]
//                 }

//                 return newArr;
//             });
//         }

//         const analyserNode = audioContext.createAnalyser();
//         analyserNode.fftSize = 2048;
//         source.connect(analyserNode);
//         analyserNode.connect(audioContext.destination);
//         setAnalyser(analyserNode);

//         // source.connect(audioContext.destination);
//         source.start();

//         currentAudioSourceRef.current = source;

//         source.onended = () => {
//             isPlayingRef.current = false;
//             playNextInQueue(audioContext, audioQueueRef, transcript, isPlayingRef, currentAudioSourceRef, setCaptions);
//         };
//     } catch (error) {
//         console.error("Error decoding or playing audio chunk:", error);
//         isPlayingRef.current = false;
//         playNextInQueue(audioContext, audioQueueRef, transcript, isPlayingRef, currentAudioSourceRef, setCaptions);
//     }
// };

// export const clearAudioQueue = (audioQueueRef: React.MutableRefObject<string[]>, currentAudioSourceRef: React.MutableRefObject<AudioBufferSourceNode | null>) => {
//     audioQueueRef.current.length = 0;
//     currentAudioSourceRef.current?.stop();
// };