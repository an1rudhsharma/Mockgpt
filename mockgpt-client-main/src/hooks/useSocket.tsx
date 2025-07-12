import { Captions, InterviewSubject } from "@/interfaces/types";
import { base64ToArrayBuffer } from "@/utils/audioUtils";
import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface WebSocketHook {
  isJoined: boolean;
  loading: boolean;
  socketRef: React.MutableRefObject<WebSocket | null>;
  captions: Captions[];
  makeSocketConnection: (interviewSubject: InterviewSubject) => void;
  analyser: AnalyserNode | null;
}

const messages: Captions[] = [];

export const useWebSocket = (): WebSocketHook => {
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [captions, setCaptions] = useState<Captions[]>(messages);
  const socketRef = useRef<WebSocket | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const audioQueueRef = useRef<string[]>([]);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const interviewId = useRef<string | null>(null);

  const navigate = useNavigate();

  // for sound wave
  const [audioContext] = useState(
    new (window.AudioContext || (window as any).webkitAudioContext)()
  );
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const makeSocketConnection = useCallback(
    (interviewSubject: InterviewSubject) => {
      try {
        setLoading(true);
        const socket = new WebSocket(
          `${import.meta.env.VITE_WEBSOCKET_URL}/${interviewSubject}`
        );
        const transcript: string[] = [];

        socket.onopen = () => {
          socketRef.current = socket;
          console.log("client: connected to server");
        };

        socket.addEventListener("message", async (message: any) => {
          if (message === "") return;

          try {
            const data = JSON.parse(message.data);

            if (data === "deepgram is active") {
              setIsJoined(true);
              setLoading(false);
            }

            if (data.event === "interviewId") {
              interviewId.current = data.payload;
            }

            if (data?.event === "playAudio") {
              audioQueueRef.current.push(data.media.payload);
              playNextInQueue(
                audioContext,
                audioQueueRef,
                transcript,
                isPlayingRef,
                currentAudioSourceRef,
                setCaptions
              );
            }

            if (data?.event === "clear") {
              // Clearing all queued audios and text messages
              clearAudioQueue(audioQueueRef, currentAudioSourceRef);
              transcript.length = 0;
            }

            if (data?.event === "text") {
              transcript.push(data.media.payload);
            }

            if (data?.event === "user") {
              setCaptions((prev) => [
                ...prev,
                {
                  id: Math.ceil(Math.random() * 10000),
                  sender: "user",
                  text: data.media.payload,
                  timestamp: new Date(),
                },
              ]);
            }
          } catch (error) {
            console.error("Failed to parse JSON:", error);
          }
        });

        socket.onclose = async () => {
          setIsJoined(false);
          setCaptions([]);
          isPlayingRef.current = false;
          audioQueueRef.current = [];
          currentAudioSourceRef.current?.stop();
          currentAudioSourceRef.current = null;

          socketRef.current = null;
          console.log("client: disconnected from server");

          setLoading(true);
          await new Promise((resolve) => setTimeout(resolve, 8000));
          setLoading(false);
          navigate(`/dashboard/review/${interviewId.current}`);
        };
      } catch (error) {
        console.error("Socket connection error:", error);
        setLoading(false);
      }
    },
    []
  );

  // Play next audio in queue
  const playNextInQueue = async (
    audioContext: AudioContext,
    audioQueueRef: React.MutableRefObject<string[]>,
    transcript: string[],
    isPlayingRef: React.MutableRefObject<boolean>,
    currentAudioSourceRef: React.MutableRefObject<AudioBufferSourceNode | null>,
    setCaptions: React.Dispatch<React.SetStateAction<Captions[]>>
  ) => {
    if (audioQueueRef.current.length === 0 || isPlayingRef.current) {
      return;
    }

    const audioData = audioQueueRef.current.shift()!;
    let transcriptText = transcript.shift() as string;

    isPlayingRef.current = true;

    try {
      const arrayBuffer = base64ToArrayBuffer(audioData);
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;

      if (transcriptText) {
        setCaptions((prev) => {
          const lastMessage = prev[prev.length - 1];
          let newArr;

          //  If the last message is of interviewer append in it else add a new user message
          if (lastMessage && lastMessage.sender !== "user") {
            prev.pop();
            newArr = [
              ...prev,
              {
                id: lastMessage.id,
                sender: lastMessage.sender,
                text: lastMessage.text + transcriptText,
                timestamp: lastMessage.timestamp,
              },
            ];
          } else {
            newArr = [
              ...prev,
              {
                id: Math.ceil(Math.random() * 1000),
                sender: "Alex",
                text: transcriptText,
                timestamp: new Date(),
              },
            ];
          }

          return newArr;
        });
      }

      // For sound wave
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 2048;
      source.connect(analyserNode);
      analyserNode.connect(audioContext.destination);
      setAnalyser(analyserNode);
      source.connect(audioContext.destination);

      source.start();

      currentAudioSourceRef.current = source;

      source.onended = () => {
        isPlayingRef.current = false;
        playNextInQueue(
          audioContext,
          audioQueueRef,
          transcript,
          isPlayingRef,
          currentAudioSourceRef,
          setCaptions
        );
      };
    } catch (error) {
      console.error("Error decoding or playing audio chunk:", error);
      isPlayingRef.current = false;
      playNextInQueue(
        audioContext,
        audioQueueRef,
        transcript,
        isPlayingRef,
        currentAudioSourceRef,
        setCaptions
      );
    }
  };

  const clearAudioQueue = (
    audioQueueRef: React.MutableRefObject<string[]>,
    currentAudioSourceRef: React.MutableRefObject<AudioBufferSourceNode | null>
  ) => {
    audioQueueRef.current.length = 0;
    currentAudioSourceRef.current?.stop();
  };

  return {
    isJoined,
    loading,
    socketRef,
    captions,
    makeSocketConnection,
    analyser,
  };
};
