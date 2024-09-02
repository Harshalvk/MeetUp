"use client";
import { useSocket } from "@/context/SocketContext";
import React from "react";
import Avatar from "./Avatar";
import { Button } from "./ui/button";
import { PhoneCall, PhoneOff } from "lucide-react";

const CallNotification = () => {
  const { ongoingCall, handleJoinCall, handleHangup } = useSocket();

  if (!ongoingCall?.isRinging) return;

  return (
    <div className="absolute bg-slate-500 bg-opacity-70 w-screen h-screen top-0 left-0 flex items-center justify-center ">
      <div className="bg-white min-w-[300px] min-h-[100px] flex flex-col items-center justify-center rounded p-4 border border-white/10">
        <div className="flex flex-col items-center">
          <Avatar src={ongoingCall.participants.caller.profile.imageUrl} />
          <h3>
            {ongoingCall.participants.caller.profile.firstName?.split(" ")[0]}
          </h3>
          <p className="text-sm mb-2">Incoming Call</p>
          <div className="flex gap-8">
            <Button
              onClick={() => handleJoinCall(ongoingCall)}
              className="w-12 h-12 bg-green-500 hover:bg-green-700 flex items-center justify-center text-white rounded-full"
            >
              <PhoneCall />
            </Button>
            <Button
              className="w-12 h-12 flex bg-red-500 hover:bg-red-700 items-center justify-center text-white rounded-full"
              onClick={() =>
                handleHangup({
                  ongoingCall: ongoingCall ? ongoingCall : undefined,
                  isEmitHangup: true,
                })
              }
            >
              <PhoneOff />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallNotification;
