import { Users } from "lucide-react";
import React, { Suspense } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useWebSocket } from "@/hooks/useSocket";
import { useMicrophone } from "@/hooks/useMicrophone";
import {
  JoinCall,
  UserVideoScreen,
  VideoScreenButtons,
} from "@/components/interview/InterviewScreenComps";
import useVideoScreen from "@/hooks/useVideoCamera";
import { LoadingSpinner } from "@/components/loader";
import { InterviewSubject } from "@/interfaces/types";

const VideoCallView = React.lazy(() =>
  import("@/components/interview/InterviewScreenComps").then((module) => ({
    default: module.VideoCallView,
  }))
);

export default function InterviewPage() {
  const navigate = useNavigate();
  const { type } = useParams();
  const {
    isJoined,
    loading,
    socketRef,
    captions,
    makeSocketConnection,
    analyser,
  } = useWebSocket();

  const { isMicropohoneOn, changeMicrophoneState } = useMicrophone(socketRef);

  const { cameraLoading, isCameraOn, setCameraLoading, setIsCameraOn } =
    useVideoScreen();

  if (!type) {
    navigate("/dashboard");
    return;
  }

  return (
    <div className="h-screen bg-[#1C1C1C] text-white p-6">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="bg-purple-600 p-1.5 rounded">
          <Users className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold">MockGPT</span>
      </Link>
      <div className="h-full w-full px-20  max-h-[calc(100vh-120px)]">
        {!loading ? (
          !isJoined ? (
            <div className="h-full w-full flex flex-col md:flex-row gap-5 items-center justify-center">
              <div className="relative w-full max-w-3xl bg-[#2C2C2C] rounded-lg overflow-hidden">
                <UserVideoScreen
                  isCameraOn={isCameraOn}
                  cameraLoading={cameraLoading}
                  setCameraLoading={setCameraLoading}
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 rounded-full flex gap-5">
                  <VideoScreenButtons
                    setIsCameraOn={setIsCameraOn}
                    isMicropohoneOn={isMicropohoneOn}
                    changeMicrophoneState={changeMicrophoneState}
                    isCameraOn={isCameraOn}
                    setCameraLoading={setCameraLoading}
                  />
                </div>
              </div>

              <div className="w-full max-w-xs flex flex-col items-center justify-center ">
                <JoinCall
                  onClick={() => {
                    if (isMicropohoneOn) {
                      changeMicrophoneState();
                    }
                    makeSocketConnection(
                      type?.split("-")[0] as InterviewSubject
                    );
                  }}
                  loading={loading}
                />
              </div>
            </div>
          ) : (
            <Suspense fallback={<LoadingSpinner />}>
              <VideoCallView
                socketRef={socketRef}
                isMicropohoneOn={isMicropohoneOn}
                changeMicrophoneState={changeMicrophoneState}
                isCameraOn={isCameraOn}
                cameraLoading={cameraLoading}
                setCameraLoading={setCameraLoading}
                setIsCameraOn={setIsCameraOn}
                captions={captions}
                analyser={analyser}
              />
            </Suspense>
          )
        ) : (
          <div className="flex h-full justify-center items-center">
            <LoadingSpinner className="h-20 w-20  m-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
