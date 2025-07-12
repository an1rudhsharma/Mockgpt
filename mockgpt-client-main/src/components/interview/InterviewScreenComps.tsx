import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Captions } from "@/interfaces/types";
import { Card } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import SoundWave from "./sound-wave";
import TextEditorModal from "./TextEditor";
import { useAuthContext } from "@/context/AuthContext";

// VideoCall View Props
interface VideoCallViewProps {
  socketRef: React.MutableRefObject<WebSocket | null>;
  isMicropohoneOn: boolean;
  changeMicrophoneState: () => void;
  isCameraOn: boolean;
  setIsCameraOn: React.Dispatch<React.SetStateAction<boolean>>;
  cameraLoading: boolean;
  setCameraLoading: React.Dispatch<React.SetStateAction<boolean>>;
  captions: Captions[];
  analyser: AnalyserNode | null;
}

// VideoCall View
export const VideoCallView: React.FC<VideoCallViewProps> = ({
  socketRef,
  isMicropohoneOn,
  changeMicrophoneState,
  isCameraOn,
  cameraLoading,
  setCameraLoading,
  setIsCameraOn,
  captions,
  analyser,
}) => {
  const [isUserFullScreen, setIsUserFullScreen] = useState<boolean>(false);
  return (
    <div className="relative h-full w-full flex flex-col md:flex-row gap-1 items-center justify-center ">
      <div className="h-full w-full flex flex-col gap-5 items-center justify-center">
        <div className="relative w-full aspect-video max-w-[900px]">
          <div
            onClick={() => {
              if (!isUserFullScreen) setIsUserFullScreen(!isUserFullScreen);
            }}
            className={`${
              isUserFullScreen
                ? "bg-[#2C2C2C] w-full h-full aspect-video max-h-[calc(100vh-200px)]"
                : "z-50 bg-[#1C1C1C] absolute bottom-4 right-4 w-48 aspect-video cursor-pointer"
            } rounded-lg overflow-hidden`}
          >
            <UserVideoScreen
              isUserFullScreen={isUserFullScreen}
              isCameraOn={isCameraOn}
              cameraLoading={cameraLoading}
              setCameraLoading={setCameraLoading}
            />
          </div>

          <div
            onClick={() => {
              if (isUserFullScreen) setIsUserFullScreen(!isUserFullScreen);
            }}
            className={`${
              !isUserFullScreen
                ? "bg-[#2C2C2C] w-full h-full aspect-video max-h-[calc(100vh-200px)]"
                : "bg-[#1C1C1C] absolute bottom-4 right-4 w-48 aspect-video cursor-pointer"
            } rounded-lg overflow-hidden`}
          >
            <SecondJoineeScreen
              isUserFullScreen={isUserFullScreen}
              analyser={analyser}
            />
          </div>
        </div>

        <div className="relative p-3 flex gap-5 justify-center  rounded-lg w-full max-w-[900px] bg-[#2C2C2C]">
          <VideoScreenButtons
            socketRef={socketRef}
            onCall={true}
            changeMicrophoneState={changeMicrophoneState}
            isCameraOn={isCameraOn}
            setIsCameraOn={setIsCameraOn}
            isMicropohoneOn={isMicropohoneOn}
            setCameraLoading={setCameraLoading}
          />
        </div>
      </div>

      <div className="w-full min-w-[400px] max-w-xs h-full">
        <ChatScreen captions={captions} />
      </div>
    </div>
  );
};

// Join Call Block
export const JoinCall: React.FC<{
  onClick: () => void;
  loading: boolean;
}> = ({ onClick, loading }) => {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-semibold mb-6">Ready to join?</h2>
      <Avatar className="w-16 h-16 mb-4">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>R</AvatarFallback>
      </Avatar>
      <p className="text-gray-400 mb-4">Alex is in the call</p>
      {loading ? (
        <Button className="bg-purple-600 hover:bg-purple-700">
          Loading...
        </Button>
      ) : (
        <Button onClick={onClick} className="bg-purple-600 hover:bg-purple-700">
          Join Now
        </Button>
      )}
    </div>
  );
};

// ChatScreen
export const ChatScreen: React.FC<{ captions: Captions[] }> = ({
  captions,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom function for chat screen
  const scrollToBottom = () => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );

    if (viewport) {
      // Scroll to bottom
      viewport.scrollTop = viewport.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [captions]);

  return (
    <Card className="w-[400px] rounded-lg overflow-hidden bg-white h-full">
      <div className="p-2 px-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Live Transcript</h3>
      </div>
      <ScrollArea ref={scrollAreaRef} className="h-[calc(100vh-200px)]">
        <div className="p-4 space-y-1">
          {captions.map((message) => (
            <div key={message.id} className="space-y-1">
              <div
                className={`${
                  message.sender === "user" ? "ml-auto" : ""
                } w-fit text-sm text-gray-500`}
              >
                {message.sender}
              </div>
              <div
                className={`p-3 rounded-lg max-w-[90%] ${
                  message.sender === "user"
                    ? "bg-purple-100 text-purple-900 ml-auto"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

// User video screen Props
interface UserScreenProps {
  isUserFullScreen?: boolean;
  isCameraOn: boolean;
  cameraLoading: boolean;
  setCameraLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

// User video screen
export const UserVideoScreen: React.FC<UserScreenProps> = ({
  isUserFullScreen = true,
  isCameraOn,
  cameraLoading,
  setCameraLoading,
}) => {
  const { user } = useAuthContext();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isCameraOn) {
      const constraints = {
        audio: false,
        video: true,
      };

      // Get Camera
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((mediaStream) => {
          streamRef.current = mediaStream;

          streamRef.current.onremovetrack = () => {
            console.log("Stream ended");
          };

          if (videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
          }
        })
        .catch((error) => {
          console.error(`getUserMedia error: ${error.name}`, error);
        })
        .finally(() => {
          setCameraLoading(false);
        });
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isCameraOn]);

  return (
    <div className="relative h-full aspect-video rounded-lg flex items-center justify-center overflow-hidden">
      {/* User Name */}
      <div
        className={`${
          isUserFullScreen
            ? "text-2xl text-md font-semibold absolute top-5 left-5 z-10"
            : "hidden"
        } `}
      >
        {user?.name}
      </div>

      {/* User Video */}
      <video
        ref={videoRef}
        className={`${
          isCameraOn && !cameraLoading
            ? "absolute top-0 left-0 w-full h-full object-cover scale-x-[-1]"
            : "hidden"
        }`}
        autoPlay
        playsInline
      />

      {/* Camera State */}
      <div
        className={`${
          isUserFullScreen ? "text-2xl" : "text-sm"
        } text-gray-400 z-10`}
      >
        {" "}
        {isCameraOn
          ? cameraLoading
            ? "Camera is starting"
            : null
          : "Camera is off"}
      </div>
    </div>
  );
};

// Interviewer Video Screen
const SecondJoineeScreen: React.FC<{
  isUserFullScreen: boolean;
  analyser: AnalyserNode | null;
}> = ({ isUserFullScreen, analyser }) => {
  return (
    <div className="h-full w-full rounded-lg flex flex-col items-center justify-center gap-3 z-10">
      <div className="absolute top-1/2 left-0 w-full h-full transform -translate-y-1/2">
        <SoundWave analyser={analyser} isUserFullScreen={isUserFullScreen} />
      </div>
      <div
        className={`${
          !isUserFullScreen ? "text-2xl font-semibold top-5 left-5 " : "hidden"
        } flex items-center gap-2 absolute z-10`}
      >
        <Avatar className={`${isUserFullScreen ? "w-12 h-12" : "w-10 h-10"}`}>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
        <p>Alex</p>
      </div>
    </div>
  );
};

// VideoButtons Props
interface VideoButtonsProps {
  socketRef?: React.MutableRefObject<WebSocket | null>;
  onCall?: boolean;
  isMicropohoneOn: boolean;
  changeMicrophoneState: () => void;
  isCameraOn: boolean;
  setIsCameraOn: React.Dispatch<React.SetStateAction<boolean>>;
  setCameraLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
// Video screen Buttons
export const VideoScreenButtons: React.FC<VideoButtonsProps> = ({
  socketRef,
  onCall = false,
  isCameraOn,
  setCameraLoading,
  setIsCameraOn,
  isMicropohoneOn,
  changeMicrophoneState,
}) => {
  const endCall = () => {
    if (socketRef && socketRef.current) {
      socketRef.current.close();
      console.log("Call has ended");
    }
  };

  return (
    <>
      <Button
        variant={isCameraOn ? "ghost" : "destructive"}
        size="icon"
        className={isCameraOn ? "border border-white" : ""}
        onClick={() => {
          setCameraLoading(true);
          setIsCameraOn(!isCameraOn);
        }}
      >
        {isCameraOn ? (
          <Video className="h-4 w-4" />
        ) : (
          <VideoOff className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant={isMicropohoneOn ? "ghost" : "destructive"}
        size="icon"
        className={isMicropohoneOn ? "border border-white" : ""}
        onClick={() => changeMicrophoneState()}
      >
        {isMicropohoneOn ? (
          <Mic className="h-4 w-4" />
        ) : (
          <MicOff className="h-4 w-4" />
        )}
      </Button>
      {onCall && (
        <>
          <Button
            variant={"destructive"}
            size="icon"
            className="w-20"
            onClick={endCall}
          >
            <PhoneOff />
          </Button>

          <TextEditorModal socketRef={socketRef} />
        </>
      )}
    </>
  );
};
