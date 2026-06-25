import { reducerCases } from '@/context/constants';
import { useStateProvider } from '@/context/state-context';
import { useCallTokens } from '@/hooks/use-calls-api';
import Image from 'next/image';
import React, { useEffect, useState, useRef } from 'react';
import { MdOutlineCallEnd } from 'react-icons/md';

function Container({ data }) {
  const [{ socket, userInfo }, dispatch] = useStateProvider();
  const [callAccepted, setCallAcepted] = useState(false);
  const { data: token } = useCallTokens(userInfo?.id);

  console.log('Token:', token);
  console.log('Room:', data.roomId);
  console.log('User:', userInfo?.id);

  console.log({
    appId: process.env.NEXT_PUBLIC_ZEGO_APP_ID,
    serverSecret: process.env.NEXT_PUBLIC_ZEGO_SERVER_ID,
    callAccepted,
  });
  // const [zgVar, setZgVar] = useState(undefined);
  // const [localStream, setLocalStream] = useState(undefined);
  // const [publishedStream, setPublishedStream] = useState(undefined);

  const zgRef = useRef(null);
  const localStreamRef = useRef(null);
  const publishedStreamRef = useRef(null);

  useEffect(() => {
    const handler = () => setCallAcepted(true);

    if (data.type === 'out-going' && socket?.current) {
      socket.current.on('accept-call', handler);
    }

    if (data.type !== 'out-going') {
      const timeout = setTimeout(() => {
        setCallAcepted(true);
      }, 1000);

      return () => clearTimeout(timeout);
    }
    return () => {
      socket?.current?.off('accept-call', handler);
    };
  }, [data.type, socket]);

  useEffect(() => {
    if (!token || !userInfo?.id) return;
  
    let zg;
    let localStream;
    let mounted = true;
  
    const startCall = async () => {
      try {
        const { ZegoExpressEngine } = await import(
          "zego-express-engine-webrtc"
        );
  
        // ================= INIT =================
        zg = new ZegoExpressEngine(
          Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID)
          // ❌ DO NOT PASS websocket URL manually
        );
  
        zgRef.current = zg;
  
        // ================= LOGIN =================
        await zg.loginRoom(
          data.roomId.toString(),
          token,
          {
            userID: userInfo.id.toString(),
            userName: userInfo.name,
          }
        );
  
        if (!mounted) return;
  
        // ================= CREATE STREAM =================
        const zegoStream = await zg.createStream({
          camera: {
            audio: true,
            video: data.callType === "video",
          },
        });
  
        if (!zegoStream) throw new Error("Stream creation failed");
  
        // 🔥 IMPORTANT FIX: always convert to real MediaStream
        localStream = new MediaStream(zegoStream.getTracks());
        localStreamRef.current = localStream;
  
        // ================= LOCAL PREVIEW =================
        const localContainer = document.getElementById("local-audio");
  
        if (localContainer) {
          localContainer.innerHTML = "";
  
          const el = document.createElement(
            data.callType === "video" ? "video" : "audio"
          );
  
          el.autoplay = true;
          el.muted = true;
          el.playsInline = true;
          el.srcObject = localStream;
  
          localContainer.appendChild(el);
        }
  
        // ================= PUBLISH STREAM =================
        const streamId = `${userInfo.id}_${Date.now()}`;
        publishedStreamRef.current = streamId;
  
        await zg.startPublishingStream(streamId, localStream);
  
        // ================= REMOTE STREAM =================
        zg.on("roomStreamUpdate", async (_, type, list) => {
          if (!mounted) return;
  
          const container = document.getElementById("remote-video");
          if (!container) return;
  
          for (const item of list || []) {
            const streamID = item.streamID;
            if (!streamID) continue;
  
            if (type === "ADD") {
              // avoid duplicate elements
              if (document.getElementById(streamID)) return;
  
              const el = document.createElement(
                data.callType === "video" ? "video" : "audio"
              );
  
              el.id = streamID;
              el.autoplay = true;
              el.playsInline = true;
  
              container.appendChild(el);
  
              try {
                const remoteStream = await zg.startPlayingStream(streamID);
                el.srcObject = remoteStream;
              } catch (err) {
                console.error("Remote play error:", err);
              }
            }
  
            if (type === "DELETE") {
              document.getElementById(streamID)?.remove();
            }
          }
        });
      } catch (err) {
        console.error("Zego error:", err);
      }
    };
  
    startCall();
  
    // ================= CLEANUP (FIXED getStats issue) =================
    return () => {
      mounted = false;
  
      try {
        if (publishedStreamRef.current && zgRef.current) {
          zgRef.current.stopPublishingStream(publishedStreamRef.current);
        }
  
        if (localStreamRef.current && zgRef.current) {
          try {
            zgRef.current.destroyStream(localStreamRef.current);
          } catch (e) {}
        }
  
        if (zgRef.current) {
          zgRef.current.logoutRoom(data.roomId.toString());
        }
      } catch (e) {
        console.error("Cleanup error:", e);
      } finally {
        zgRef.current = null;
        localStreamRef.current = null;
        publishedStreamRef.current = null;
      }
    };
  }, [token, userInfo?.id, data.roomId, data.callType]);

  const endCall = () => {
    try {
      if (publishedStreamRef.current) {
        zgRef.current?.stopPublishingStream(publishedStreamRef.current);
      }

      if (localStreamRef.current) {
        zgRef.current?.destroyStream(localStreamRef.current);
      }

      zgRef.current?.logoutRoom(data.roomId.toString());
    } catch (error) {
      console.error(error);
    } finally {
      if (data.callType === 'voice') {
        socket.current.emit('reject-voice-call', {
          from: data.id,
        });
      } else {
        socket.current.emit('reject-video-call', {
          from: data.id,
        });
      }

      dispatch({ type: reducerCases.END_CALL });
    }
  };

  return (
    <div className="border-conversation-border border-l w-full bg-conversation-panel-background flex flex-col h-[100vh] overflow-hidden items-center justify-center text-white">
      <div className="flex flex-col gap-3 items-center">
        <span className="text-5xl">{data.name}</span>
        <span className="text-lg">
          {callAccepted && data.callType !== 'video' ? 'On Going Call' : 'Calling'}
        </span>
      </div>

      {(!callAccepted || data.callType === 'audio') && (
        <div className="mt-10 mb-10">
          <Image
            src={data.profilePicture}
            alt="avatar"
            height={300}
            width={300}
            className="rounded-full"
          />
        </div>
      )}

      <div className="my-5 relative" id="remote-video">
        <div className="absolute bottom-5 right-5" id="local-audio"></div>
      </div>
      <div className="h-16 w-16 bg-red-600 flex items-center justify-center rounded-full">
        <MdOutlineCallEnd className="text-3xl cursor-pointer" onClick={endCall} />
      </div>
    </div>
  );
}

export default Container;
