import { reducerCases } from '@/context/constants';
import { useStateProvider } from '@/context/state-context';
import { useCallTokens } from '@/hooks/use-calls-api';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { MdOutlineCallEnd } from 'react-icons/md';

function Container({ data }) {
  const [{ socket, userInfo }, dispatch] = useStateProvider();
  const [callAccepted, setCallAccepted] = useState(false);
  const { data: token } = useCallTokens(userInfo?.id);

  const zgRef = useRef(null);
  const localStreamRef = useRef(null);
  const publishedStreamRef = useRef(null);
  const remoteStreamIdsRef = useRef(new Set());

  useEffect(() => {
    if (!data) return;
    setCallAccepted(data.type !== 'out-going');
  }, [data]);

  useEffect(() => {
    if (!data || data.type !== 'out-going' || !socket?.current) return undefined;

    const handler = () => setCallAccepted(true);
    socket.current.on('accept-call', handler);

    return () => {
      socket?.current?.off('accept-call', handler);
    };
  }, [data, socket]);

  useEffect(() => {
    if (!data || !token || !userInfo?.id || !userInfo?.name) return undefined;

    let zg;
    let mounted = true;

    const cleanupCallSession = async () => {
      const engine = zgRef.current;
      if (!engine) return;

      try {
        for (const streamId of remoteStreamIdsRef.current) {
          await engine.stopPlayingStream(streamId);
        }
      } catch (error) {
        console.error('Failed to stop remote stream playback:', error);
      } finally {
        remoteStreamIdsRef.current.clear();
      }

      try {
        if (publishedStreamRef.current) {
          await engine.stopPublishingStream(publishedStreamRef.current);
        }
      } catch (error) {
        console.error('Failed to stop publishing stream:', error);
      } finally {
        publishedStreamRef.current = null;
      }

      try {
        if (localStreamRef.current) {
          await engine.destroyStream(localStreamRef.current);
        }
      } catch (error) {
        console.error('Failed to destroy local stream:', error);
      } finally {
        localStreamRef.current = null;
      }

      try {
        await engine.logoutRoom(data.roomId.toString());
      } catch (error) {
        console.error('Failed to logout from room:', error);
      } finally {
        zgRef.current = null;
      }
    };

    const startCall = async () => {
      try {
        const { ZegoExpressEngine } = await import('zego-express-engine-webrtc');
        const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
        if (!appId) {
          console.error('Missing NEXT_PUBLIC_ZEGO_APP_ID for call initialization.');
          return;
        }

        zg = new ZegoExpressEngine(appId);
        zgRef.current = zg;

        await zg.loginRoom(data.roomId.toString(), token, {
          userID: userInfo.id.toString(),
          userName: userInfo.name,
        });

        if (!mounted) return;

        const zegoStream = await zg.createStream({
          camera: {
            audio: true,
            video: data.callType === 'video',
          },
        });

        if (!zegoStream) throw new Error('Stream creation failed');

        localStreamRef.current = zegoStream;
        const localContainer = document.getElementById('local-audio');

        if (localContainer) {
          localContainer.innerHTML = '';
          const el = document.createElement(data.callType === 'video' ? 'video' : 'audio');
          el.autoplay = true;
          el.muted = true;
          el.playsInline = true;
          el.srcObject = zegoStream;
          localContainer.appendChild(el);
        }

        const streamId = `${userInfo.id}_${Date.now()}`;
        publishedStreamRef.current = streamId;
        await zg.startPublishingStream(streamId, zegoStream);

        zg.on('roomStreamUpdate', async (_, type, list) => {
          if (!mounted) return;

          const container = document.getElementById('remote-video');
          if (!container) return;

          for (const item of list || []) {
            const streamID = item.streamID;
            if (!streamID) continue;

            if (type === 'ADD') {
              if (document.getElementById(streamID)) continue;

              const el = document.createElement(data.callType === 'video' ? 'video' : 'audio');
              el.id = streamID;
              el.autoplay = true;
              el.playsInline = true;
              container.appendChild(el);

              try {
                const remoteStream = await zg.startPlayingStream(streamID);
                remoteStreamIdsRef.current.add(streamID);
                el.srcObject = remoteStream;
              } catch (err) {
                console.error('Remote play error:', err);
              }
            }

            if (type === 'DELETE') {
              remoteStreamIdsRef.current.delete(streamID);
              try {
                await zg.stopPlayingStream(streamID);
              } catch (error) {
                console.error('Remote stream stop error:', error);
              }
              document.getElementById(streamID)?.remove();
            }
          }
        });
      } catch (err) {
        console.error('Zego error:', err);
      }
    };

    startCall();

    return () => {
      mounted = false;
      cleanupCallSession();
    };
  }, [data, token, userInfo?.id, userInfo?.name]);

  const endCall = () => {
    if (!data) return;

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
        socket?.current?.emit('reject-voice-call', {
          from: data.id,
        });
      } else {
        socket?.current?.emit('reject-video-call', {
          from: data.id,
        });
      }

      dispatch({ type: reducerCases.END_CALL });
    }
  };

  if (!data) {
    return null;
  }

  return (
    <div className="border-conversation-border border-l w-full bg-conversation-panel-background flex flex-col h-[100vh] overflow-hidden items-center justify-center text-white">
      <div className="flex flex-col gap-3 items-center">
        <span className="text-5xl">{data.name}</span>
        <span className="text-lg">
          {callAccepted ? 'On Going Call' : 'Calling'}
        </span>
      </div>

      {(!callAccepted || data.callType === 'voice') && (
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
