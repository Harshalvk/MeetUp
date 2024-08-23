import CallNotification from "@/components/CallNotification";
import ListOnlineUsers from "@/components/ListOnlineUsers";
import React from "react";

export default function Home() {
  return (
    <div>
      <ListOnlineUsers />
      <CallNotification/>
    </div>
  );
}
