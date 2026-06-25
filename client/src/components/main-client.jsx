'use client';

import { useEffect, useRef, useState } from 'react';
import ChatList from './Chatlist/chat-list';
import Empty from './Empty';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '@/utils/firebase-config';
import { checkUser } from '@/api/auth.api';
import { queryKeys } from '@/api/query-keys';
import { HOST } from '@/utils/api-routes';
import { useRouter } from 'next/navigation';
import { useStateProvider } from '@/context/state-context';
import { reducerCases } from '@/context/constants';
import { useMessages } from '@/hooks/use-messages-api';
import { useQueryClient } from '@tanstack/react-query';
import Chat from './Chat/Chat';
import SearchMessages from './Chat/search-messages';
import VideoCall from './Call/video-call';
import VoiceCall from './Call/voice-call';
import IncomingCall from './common/incoming-call';
import IncomingVideoCall from './common/incoming-video-call';
import { setAuthSessionCookie } from '@/lib/auth-session';
import { io } from 'socket.io-client';

function MainClient() {
  const router = useRouter();
  const [
    {
      userInfo,
      currentChatUser,
      messagesSearch,
      voiceCall,
      videoCall,
      incomingVoiceCall,
      incomingVideoCall,
    },
    dispatch,
  ] = useStateProvider();
  const socket = useRef();
  const queryClient = useQueryClient();
  const [authReady, setAuthReady] = useState(Boolean(userInfo?.id));
  const { data: messages } = useMessages(userInfo?.id, currentChatUser?.id);

  useEffect(() => {
    if (userInfo?.id && userInfo?.email) {
      setAuthSessionCookie(userInfo);
    }
  }, [userInfo]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      if (!currentUser) {
        setAuthReady(false);
        router.replace('/login');
        return;
      }

      if (currentUser.email && !userInfo?.id) {
        try {
          const data = await queryClient.fetchQuery({
            queryKey: queryKeys.auth.checkUser(currentUser.email),
            queryFn: () => checkUser(currentUser.email),
            staleTime: 5 * 60 * 1000,
          });

          if (!data.status) {
            setAuthReady(false);
            dispatch({ type: reducerCases.SET_NEW_USER, newUser: true });
            dispatch({
              type: reducerCases.SET_USER_INFO,
              userInfo: {
                name: currentUser.displayName ?? '',
                email: currentUser.email,
                profileImage: currentUser.photoURL ?? '/default_avatar.png',
                status: '',
              },
            });
            router.replace('/onboarding');
            return;
          }

          if (data.data) {
            const { id, email, name, profilePicture: profileImage, status } = data.data;
            const verifiedUser = { id, name, email, profileImage, status };
            dispatch({
              type: reducerCases.SET_USER_INFO,
              userInfo: verifiedUser,
            });
            setAuthSessionCookie(verifiedUser);
          }
        } catch (error) {
          console.error('Failed to verify user session:', error);
          setAuthReady(false);
          router.replace('/login');
          return;
        }
      }

      setAuthReady(true);
    });

    return unsubscribe;
  }, [dispatch, queryClient, router, userInfo?.id]);

  useEffect(() => {
    if (!userInfo) return undefined;

    const currentSocket = io(HOST);
    socket.current = currentSocket;
    currentSocket.emit('add-user', userInfo.id);
    dispatch({ type: reducerCases.SET_SOCKET, socket });

    currentSocket.on('msg-receiver', (data) => {
      dispatch({
        type: reducerCases.ADD_MESSAGE,
        newMessage: {
          ...data.message,
        },
      });
    });

    currentSocket.on('incoming-voice-call', ({ from, roomId, callType }) => {
      dispatch({
        type: reducerCases.SET_INCOMING_VOICE_CALL,
        incomingVoiceCall: { ...from, roomId, callType },
      });
    });

    currentSocket.on('incoming-video-call', ({ from, roomId, callType }) => {
      dispatch({
        type: reducerCases.SET_INCOMING_VIDEO_CALL,
        incomingVideoCall: { ...from, roomId, callType },
      });
    });

    currentSocket.on('voice-call-rejected', () => {
      dispatch({ type: reducerCases.END_CALL });
    });

    currentSocket.on('video-call-rejected', () => {
      dispatch({ type: reducerCases.END_CALL });
    });

    currentSocket.on('online-users', ({ onlineUsers }) => {
      dispatch({ type: reducerCases.SET_ONLINE_USERS, onlineUsers });
    });

    return () => {
      currentSocket.disconnect();
      socket.current = undefined;
    };
  }, [dispatch, userInfo]);

  useEffect(() => {
    if (messages) {
      dispatch({ type: reducerCases.SET_MESSAGES, messages });
    }
  }, [dispatch, messages]);

  if (!authReady || !userInfo?.id) {
    return null;
  }

  return (
    <>
      {incomingVideoCall && <IncomingVideoCall />}
      {incomingVoiceCall && <IncomingCall />}
      {videoCall && (
        <div className="h-screen w-screen max-h-full overflow-hidden">
          <VideoCall />
        </div>
      )}
      {voiceCall && (
        <div className="h-screen w-screen max-h-full overflow-hidden">
          <VoiceCall />
        </div>
      )}

      {!voiceCall && !videoCall && (
        <div className="grid grid-cols-main h-screen w-screen max-h-screen max-w-screen">
          <ChatList />
          {currentChatUser ? (
            <div className={messagesSearch ? 'grid grid-cols-2' : 'grid'}>
              <Chat />
              {messagesSearch && <SearchMessages />}
            </div>
          ) : (
            <Empty />
          )}
        </div>
      )}
    </>
  );
}

export default MainClient;
