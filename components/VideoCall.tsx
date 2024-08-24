"use client";
import { useSocket } from "@/context/SocketContext";
import React, { useCallback, useEffect, useState } from "react";
import VideoContainer from "./VideoContainer";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { Button } from "./ui/button";

const VideoCall = () => {
  const { localStream } = useSocket();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVidOn, setIsVidOn] = useState(true);

  useEffect(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      setIsVidOn(videoTrack.enabled);

      const audioTrack = localStream.getAudioTracks()[0];
      setIsMicOn(audioTrack.enabled);
    }
  }, [localStream]);

  const toggleCamera = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVidOn(videoTrack.enabled);
    }
  }, [localStream]);

  const toggleMic = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  }, [localStream]);

  return (
    <div>
      <div>
        {localStream && (
          <VideoContainer
            stream={localStream}
            isLocalStream={true}
            isOnCall={false}
          />
        )}
      </div>
      <div className="mt-8 flex items-center justify-center">
        <Button variant={"ghost"} onClick={toggleMic}>
          {isMicOn ? <MicOff /> : <Mic />}
        </Button>
        <Button
          className="px-4 py-2 bg-rose-500 hover:bg-rose-700 text-white rounded mx-4"
          onClick={() => {}}
        >
          End Call
        </Button>
        <Button variant={"ghost"} onClick={toggleCamera}>
          {isVidOn ? <VideoOff /> : <Video />}
        </Button>
      </div>
    </div>
  );
};

export default VideoCall;
