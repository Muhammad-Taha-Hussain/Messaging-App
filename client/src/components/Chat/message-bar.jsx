import { useStateProvider } from '@/context/state-context';
import React, { useState, useEffect, useRef } from 'react';
import { BsEmojiSmile } from 'react-icons/bs';
import { FaMicrophone } from 'react-icons/fa';
import { ImAttachment } from 'react-icons/im';
import { MdSend } from 'react-icons/md';
import { reducerCases } from '@/context/constants';
import { useSendImageMessage, useSendTextMessage } from '@/hooks/use-messages-api';
import EmojiPicker from 'emoji-picker-react';
import PhotoPicker from '../common/photo-picker';
import dynamic from 'next/dynamic';

const CaptureAudio = dynamic(() => import('../common/capture-audio'), {
  ssr: false,
});

function MessageBar() {
  const [{ userInfo, currentChatUser, socket }, dispatch] = useStateProvider();
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEMojiPicker] = useState(false);
  const [grabPhoto, setGrabPhoto] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const emojiRef = useRef(null);
  const { mutateAsync: sendTextMessage } = useSendTextMessage();
  const { mutateAsync: sendImageMessage } = useSendImageMessage();

  useEffect(() => {
    if (grabPhoto) {
      const data = document.getElementById('photo-picker');
      data.click();
      document.body.onfocus = () => {
        setTimeout(() => {
          setGrabPhoto(false);
        }, 1000);
      };
    }
  }, [grabPhoto]);

  const sendMessage = async () => {
    try {
      const sentMessage = await sendTextMessage({
        from: userInfo?.id,
        to: currentChatUser?.id,
        message,
      });
      socket.current.emit('send-msg', {
        from: userInfo?.id,
        to: currentChatUser?.id,
        message: sentMessage,
      });
      dispatch({
        type: reducerCases.ADD_MESSAGE,
        newMessage: {
          ...sentMessage,
        },
        fromSelf: true,
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  const photoPickerChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      const sentMessage = await sendImageMessage({
        from: userInfo.id,
        to: currentChatUser.id,
        file,
      });
      socket.current.emit('send-msg', {
        from: userInfo?.id,
        to: currentChatUser?.id,
        message: sentMessage,
      });
      dispatch({
        type: reducerCases.ADD_MESSAGE,
        newMessage: {
          ...sentMessage,
        },
        fromSelf: true,
      });
    } catch (error) {
      console.error('Image upload failed:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiRef.current &&
        !emojiRef.current.contains(event.target) &&
        event.target.id !== 'emoji-open'
      ) {
        setShowEMojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-panel-header-background h-20 px-4 flex items-center gap-6 relative">
      {!showAudioRecorder && (
        <>
          <div className="flex gap-6"></div>
          <div className="flex gap-6">
            <BsEmojiSmile
              className="text-panel-header-icon cursor-pointer text-2xl"
              title="Emoji"
              id="emoji-open"
              onClick={() => setShowEMojiPicker(!showEmojiPicker)}
            />
            {showEmojiPicker && (
              <div ref={emojiRef} className="absolute bottom-24 left-16 z-40">
                <EmojiPicker
                  onEmojiClick={(emoji) =>
                    setMessage((prevMessage) => prevMessage + emoji.emoji)
                  }
                  theme="dark"
                />
              </div>
            )}
            <ImAttachment
              className="text-panel-header-icon cursor-pointer text-xl"
              title="Attach"
              onClick={() => setGrabPhoto(true)}
            />
          </div>
          <div className="w-full rounded-lg h-10 flex items-center">
            <input
              type="text"
              placeholder="Type a message"
              className="bg-input-background rounded-lg px-5 py-4 text-lg focus:outline-none h-10 text-white placeholder:text-sm w-full"
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && message.trim() !== '') sendMessage();
              }}
            />
          </div>
          <div className="flex w-auto items-center justify-center">
            <button className="flex items-center justify-center gap-6">
              {message.length ? (
                <MdSend
                  className="text-panel-header-icon cursor-pointer text-xl"
                  title="Send Message"
                  onClick={sendMessage}
                />
              ) : (
                <FaMicrophone
                  className="text-panel-header-icon cursor-pointer text-xl"
                  title="Record"
                  onClick={() => setShowAudioRecorder(true)}
                />
              )}
            </button>
          </div>
        </>
      )}
      {grabPhoto && <PhotoPicker onChange={photoPickerChange} />}
      {showAudioRecorder && <CaptureAudio hide={setShowAudioRecorder} />}
    </div>
  );
}

export default MessageBar;
