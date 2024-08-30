import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";

interface IVideoContainer {
  stream: MediaStream | null;
  isLocalStream: boolean;
  isOnCall: boolean;
}

const VideoContainer = ({
  stream,
  isLocalStream,
  isOnCall,
}: IVideoContainer) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  return (
    <video
      className={cn(
        "rounded border w-[800px] scale-x-[-1]",
        isLocalStream && isOnCall && "w-[200px] h-auto absolute border-black border-2 z-10"
      )}
      ref={videoRef}
      autoPlay
      muted={isLocalStream}
    />
  );
};

export default VideoContainer;
