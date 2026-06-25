import React, { useState, useEffect, useRef } from 'react';
import { useStateProvider } from '@/context/state-context';
import { FaPlay, FaStop } from 'react-icons/fa';
import WaveSurfer from 'wavesurfer.js';
import { resolveMediaUrl } from '@/utils/resolve-media-url';
import Avatar from '../common/avatar';
import { calculateTime } from '@/utils/calculate-time';
import MessageStatus from '../common/message-status';

function VoiceMessage({ message }) {
  const [{ userInfo, currentChatUser }] = useStateProvider();
  const [currentPlayBackTime, setCurrentPlayBackTime] = useState(0);
  const [audioMessage, setAudioMessage] = useState(null);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const waveForm = useRef(null);
  const waveFormRef = useRef(null);

  useEffect(() => {
    if (audioMessage) {
      const updateTime = () => setCurrentPlayBackTime(audioMessage.currentTime);
      audioMessage.addEventListener('timeupdate', updateTime);
      return () => {
        audioMessage.removeEventListener('timeupdate', updateTime);
      };
    }
  }, [audioMessage]);

  useEffect(() => {
    if (waveForm.current === null) {
      waveForm.current = WaveSurfer.create({
        container: waveFormRef.current,
        waveColor: '#ccc',
        progressColor: '#005c4b',
        cursorColor: '#7ae3c3',
        barWidth: 2,
        height: 30,
        responsive: true,
      });
      waveForm.current.on('finish', () => {
        setIsPlaying(false);
      });
    }
    return () => {
      if (waveForm.current) {
        waveForm.current.destroy();
        waveForm.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const loadAudio = async () => {
      const audioURL = resolveMediaUrl(message.message);
      const audio = new Audio(audioURL);
      setAudioMessage(audio);
      waveForm.current.load(audioURL);
      waveForm.current.on('ready', () => {
        setTotalDuration(waveForm.current.getDuration());
      });
    };
    loadAudio();
  }, [message.message]);

  const formatTime = (time) => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div
      className={`flex items-center gap-5 text-white px-4 pr-2 py-4 text-sm rounded-md ${
        message.senderId === currentChatUser.id
          ? 'bg-incoming-background'
          : 'bg-outgoing-background'
      }`}
    >
      <div>
        <Avatar type={'lg'} image={currentChatUser?.profilePicture} />
      </div>
      <div className="cursor-pointer text-xl">
        {!isPlaying ? (
          <FaPlay
            onClick={() => {
              waveForm.current.stop();
              waveForm.current.play();
              setIsPlaying(true);
            }}
            title="Play audio"
          />
        ) : (
          <FaStop
            onClick={() => {
              waveForm.current.stop();
              audioMessage.pause();
              setIsPlaying(false);
            }}
            title="Pause audio"
          />
        )}
      </div>
      <div className="relative">
        <div className="w-60" ref={waveFormRef} />
        <div className="text-bubble-meta text-[11px] pt-1 flex justify-between absolute bottom-[-22px] w-full">
          <span>{formatTime(isPlaying ? currentPlayBackTime : totalDuration)}</span>
          <div className="flex gap-1">
            <span>{calculateTime(message.createdAt)}</span>
            {message.senderId === userInfo.id && (
              <MessageStatus MessageStatus={message.messageStatus} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoiceMessage;
