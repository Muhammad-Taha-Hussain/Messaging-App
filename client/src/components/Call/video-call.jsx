import { useStateProvider } from '@/context/state-context';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';

const Container = dynamic(() => import('./container'), { ssr: false });

function VideoCall() {
  const [{ videoCall, socket, userInfo }] = useStateProvider();

  useEffect(() => {
    if (videoCall && videoCall.type === 'out-going' && socket?.current && userInfo?.id) {
      socket.current.emit('outgoing-video-call', {
        to: videoCall.id,
        from: {
          id: userInfo.id,
          profilePicture: userInfo.profileImage,
          name: userInfo.name,
        },
        callType: videoCall.callType,
        roomId: videoCall.roomId,
      });
    }
  }, [socket, userInfo?.id, userInfo?.name, userInfo?.profileImage, videoCall]);

  if (!videoCall) {
    return null;
  }

  return <Container data={videoCall} />;
}

export default VideoCall;
