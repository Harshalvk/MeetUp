"use client";

import { servers } from "@/lib/constants";
import React, { useEffect, useRef, useState } from "react";

export default function Home() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(s);
      } catch (err) {
        console.error("getUserMedia error", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const createPeerConnection = (socket: WebSocket) => {
    console.log("creating RTCPeerConnection");
    const pc = new RTCPeerConnection(servers);

    const rStream = new MediaStream();
    setRemoteStream(rStream);

    pc.ontrack = (event) => {
      console.log("pc.ontrack", event);
      const incoming = event.streams?.[0];
      if (incoming) {
        incoming.getTracks().forEach((t) => rStream.addTrack(t));
      } else {
        event.track && rStream.addTrack(event.track);
      }
    };

    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        console.log("pc.onicecandidate => send candidate", ev.candidate);
        socket.send(
          JSON.stringify({ type: "ice-candidate", candidate: ev.candidate })
        );
      }
    };

    return pc;
  };

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    wsRef.current = socket;

    socket.onopen = () => {
      console.log("ws open, joining room");
      socket.send(JSON.stringify({ type: "join", roomId: "room2" }));
    };

    socket.onmessage = async (ev) => {
      const msg = JSON.parse(ev.data);
      console.log("ws.onmessage", msg);

      if (msg.type === "peer-joined") {
        console.log("peer-joined: create offer (we are offerer)");
        if (!localStream) {
          console.warn("no local stream yet; cannot create offer");
          return;
        }
        pcRef.current = createPeerConnection(socket);
        localStream
          .getTracks()
          .forEach((t) => pcRef.current!.addTrack(t, localStream));

        try {
          const offer = await pcRef.current.createOffer();
          await pcRef.current.setLocalDescription(offer);
          socket.send(JSON.stringify({ type: "offer", offer }));
          console.log("offer sent");
        } catch (err) {
          console.error("createOffer error", err);
        }
      }

      if (msg.type === "offer") {
        console.log("received offer");
        if (!localStream) {
          console.warn("no local stream yet; cannot answer");
          return;
        }

        pcRef.current = createPeerConnection(socket);
        localStream
          .getTracks()
          .forEach((t) => pcRef.current!.addTrack(t, localStream));

        try {
          await pcRef.current.setRemoteDescription(msg.offer);
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          socket.send(JSON.stringify({ type: "answer", answer }));
          console.log("answer sent");
        } catch (err) {
          console.error("handle offer error", err);
        }
      }

      if (msg.type === "answer") {
        console.log("received answer");
        try {
          if (!pcRef.current) {
            console.warn("no pc when answer arrived");
            return;
          }
          await pcRef.current.setRemoteDescription(msg.answer);
          console.log("remote description set (answer)");
        } catch (err) {
          console.error("setRemoteDescription(answer) error", err);
        }
      }

      if (msg.type === "ice-candidate") {
        console.log("received remote ICE candidate", msg.candidate);
        try {
          if (!pcRef.current) {
            console.warn("no pc yet to addIceCandidate");
            return;
          }
          await pcRef.current.addIceCandidate(
            new RTCIceCandidate(msg.candidate)
          );
        } catch (err) {
          console.error("addIceCandidate error", err);
        }
      }

      if (msg.type === "peer-left") {
        console.log("peer-left");
        setRemoteStream(null);
      }
    };

    socket.onerror = (e) => console.error("ws error", e);
    socket.onclose = () => console.log("ws closed");

    return () => {
      socket.close();
      wsRef.current = null;
    };
  }, [localStream]);

  return (
    <div className="h-screen w-full bg-white">
      <div className="flex flex-col lg:flex-row w-full gap-3 p-3 h-1/2">
        <video
          ref={localVideoRef}
          className="bg-black flex-1 -scale-x-100"
          autoPlay
          playsInline
          muted
        />
        <video
          ref={remoteVideoRef}
          className={`bg-black flex-1 ${remoteStream ? "block" : "hidden"}`}
          autoPlay
          playsInline
        />
      </div>
    </div>
  );
}
