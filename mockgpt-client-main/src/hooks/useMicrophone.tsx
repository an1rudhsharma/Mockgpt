import { useRef, useState } from "react";

export const useMicrophone = (
  socketRef: React.MutableRefObject<WebSocket | null>
) => {
  const audioStream = useRef<MediaStream | null>(null);
  const microphone = useRef<MediaRecorder | null>(null);
  const microphoneStateRef = useRef<boolean>(false);

  const [isMicropohoneOn, setIsMicrophoneOn] = useState<boolean>(false);

  const changeMicrophoneState = async () => {
    try {
      if (!isMicropohoneOn) {
        microphoneStateRef.current = true;
        setIsMicrophoneOn(true);
        if (!microphone.current && socketRef.current) {
          let stream = audioStream.current;

          if (!stream) {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioStream.current = stream;
          }

          const myMicrophone = new MediaRecorder(stream, {
            mimeType: "audio/webm",
          });
          microphone.current = myMicrophone;

          await openMicrophone(microphone, socketRef);
        }
      } else {
        // closeMicrophone(microphone, audioStream);
        microphoneStateRef.current = false;
        setIsMicrophoneOn(false);
      }
    } catch (error) {
      handleMicrophoneError(error);
    }
  };

  const openMicrophone = (
    microphone: React.MutableRefObject<MediaRecorder | null>,
    socketRef: React.MutableRefObject<WebSocket | null>
  ) => {
    return new Promise((resolve, reject) => {
      if (microphone.current) {
        microphone.current.onstart = () => {
          console.log("client: microphone opened");
          resolve(0);
        };

        microphone.current.onstop = () => {
          if (microphone.current) {
            microphone.current.onstart = null;
            microphone.current.onstop = null;
            microphone.current.ondataavailable = null;
            microphone.current = null;
            console.log("client: microphone closed");
          }
        };

        microphone.current.ondataavailable = async (event: BlobEvent) => {
          if (
            microphoneStateRef.current &&
            event.data.size > 0 &&
            socketRef.current &&
            socketRef.current.readyState === WebSocket.OPEN
          ) {
            // Convert the Blob to an ArrayBuffer
            const arrayBuffer = await event.data.arrayBuffer();

            // Convert the ArrayBuffer to a Buffer
            const base64Chunk = arrayBufferToBase64(arrayBuffer);

            socketRef.current.send(
              JSON.stringify({ type: "media", data: base64Chunk })
            );
          }
        };

        try {
          microphone.current.start(1000);
        } catch (error) {
          reject(error);
        }
      }
    });
  };

  return { microphone, changeMicrophoneState, isMicropohoneOn };
};

// const closeMicrophone = (
//   microphone: React.MutableRefObject<MediaRecorder | null>,
//   audioStream: React.MutableRefObject<MediaStream | null>
// ) => {
//   if (microphone.current) {
//     microphone.current.stop();
//   }

//   if (audioStream.current) {
//     audioStream.current.getTracks().forEach((track) => track.stop());
//     audioStream.current = null;
//   }
// };

const handleMicrophoneError = (error: unknown) => {
  if (error instanceof DOMException) {
    switch (error.name) {
      case "NotAllowedError":
        alert("Microphone access denied. Please grant permissions.");
        break;
      case "NotFoundError":
        alert("No microphone device found.");
        break;
      default:
        console.error("Microphone error:", error.message);
    }
  } else {
    console.error("Unexpected error:", error);
  }
};

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
