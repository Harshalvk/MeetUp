"use client";

import { servers } from "@/lib/constants";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  // const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>();
  const [p1Offer, setp1Offer] = useState<RTCSessionDescriptionInit>();
  const [p2Answer, setp2Answer] = useState<RTCSessionDescriptionInit>();

  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const ws = useRef<WebSocket | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function fetchStream() {
      const lstream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(lstream);
    }
    fetchStream();
  }, []);

  useEffect(() => {
    if (!localStream) return;

    const createOffer = async () => {
      peerConnection.current = new RTCPeerConnection(servers);

      const rStream = new MediaStream();
      setRemoteStream(rStream);

      localStream.getTracks().forEach((track) => {
        peerConnection.current!.addTrack(track, localStream);
      });

      if (peerConnection) {
        peerConnection.current.ontrack = (event) => {
          event.streams[0].getTracks().forEach((track) => {
            remoteStream?.addTrack(track);
          });
        };

        peerConnection.current.onicecandidate = async (event) => {
          if (event.candidate) {
            ws.current?.send(
              JSON.stringify({
                type: "ice-candidate",
                candidate: event.candidate,
              })
            );
          }
        };
      }

      const offer = await peerConnection.current.createOffer();
      setp1Offer(offer);
      await peerConnection.current.setLocalDescription(offer);

      ws.current?.send(
        JSON.stringify({
          type: "offer",
          offer: offer,
        })
      );
    };

    createOffer();
  }, [localStream]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    ws.current = socket;

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "join",
          roomId: "room2",
        })
      );
    };

    socket.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "offer") {
        console.log("client-OFFER:::", msg.offer);
        peerConnection.current = new RTCPeerConnection(servers);

        const rStream = new MediaStream();
        setRemoteStream(rStream);

        localStream?.getTracks().forEach((track) => {
          peerConnection.current!.addTrack(track, localStream);
        });

        if (peerConnection) {
          peerConnection.current.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
              remoteStream?.addTrack(track);
            });
          };

          peerConnection.current.onicecandidate = async (event) => {
            if (event.candidate) {
              ws.current?.send(
                JSON.stringify({
                  type: "ice-candidate",
                  candidate: event.candidate,
                })
              );
            }
          };
        }

        await peerConnection.current.setRemoteDescription(p1Offer!);

        const answer = await peerConnection.current.createAnswer();
        setp2Answer(answer);

        await peerConnection.current.setLocalDescription(answer);

        ws.current?.send(
          JSON.stringify({
            type: "answer",
            answer,
          })
        );
      }

      if (msg.type === "answer") {
        console.log("client-Message:::", msg.answer);

        if (!peerConnection.current?.currentRemoteDescription) {
          peerConnection.current?.setRemoteDescription(p2Answer!);
        }
      }

      if (msg.type === "ice-candidate") {
        console.log("client-candidate::", msg.candidate);

        if (peerConnection) {
          peerConnection.current?.addIceCandidate(msg.candidate);
        }
      }
    };
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

  return (
    <div className="h-screen w-full bg-white">
      <div className="flex gap-3 p-3 h-1/2">
        <video
          ref={localVideoRef}
          className="bg-black flex-1 -scale-x-100"
          autoPlay
          playsInline
        />
        <video
          ref={localVideoRef}
          className="bg-black flex-1"
          autoPlay
          playsInline
        ></video>
      </div>
    </div>
  );
}
