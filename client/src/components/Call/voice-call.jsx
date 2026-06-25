import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useStateProvider } from '@/context/state-context';

const Container = dynamic(() => import('./container'), { ssr: false });

function VoiceCall() {
  const [{ voiceCall, socket, userInfo }] = useStateProvider();

  useEffect(() => {
    if (voiceCall?.type === 'out-going' && socket?.current && userInfo?.id) {
      socket.current.emit('outgoing-voice-call', {
        to: voiceCall.id,
        from: {
          id: userInfo.id,
          profilePicture: userInfo.profileImage,
          name: userInfo.name,
        },
        callType: voiceCall.callType,
        roomId: voiceCall.roomId,
      });
    }
  }, [socket, userInfo?.id, userInfo?.name, userInfo?.profileImage, voiceCall]);

  if (!voiceCall) {
    return null;
  }

  return <Container data={voiceCall} />;
}

export default VoiceCall;
