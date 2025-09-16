import React, { useState, useEffect, useRef } from "react";
import { useStateProvider } from "@/context/StateContext";
import {
  FaMicrophone,
  FaPause,
  FaPauseCircle,
  FaPlay,
  FaStop,
  FaTrash,
} from "react-icons/fa";
import { MdSend } from "react-icons/md";
import WaveSurfer from "wavesurfer.js";
import {
  ADD_AUDIO_MESSAGE_ROUTE,
  ADD_MESSAGE_ROUTE,
  HOST,
} from "@/utils/ApiRoutes";
import axios from "axios";
import { reducerCases } from "@/context/constants";
import Avatar from "../common/Avatar";
import { calculateTime } from "@/utils/CalculateTime";
import MessageStatus from "../common/MessageStatus";

function VoiceMessage({ message }) {
  const [{ userInfo, currentChatUser, socket }, dispatch] = useStateProvider();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentPlayBackTime, setCurrentPlayBackTime] = useState(0);
  const [audioMessage, setAudioMessage] = useState(null);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const waveForm = useRef(null);
  const mediaRecorderRef = useRef(null);
  const waveFormRef = useRef(null);
  const audioChunksRef = useRef([]); // store chunks properly

  // Track playback time
  useEffect(() => {
    if (audioMessage) {
      const updateTime = () => setCurrentPlayBackTime(audioMessage.currentTime);
      audioMessage.addEventListener("timeupdate", updateTime);
      return () => {
        audioMessage.removeEventListener("timeupdate", updateTime);
      };
    }
  }, [audioMessage]);

  // Setup waveform once
  useEffect(() => {
    if (waveForm.current === null) {
      waveForm.current = WaveSurfer.create({
        container: waveFormRef.current,
        waveColor: "#ccc",
        progressColor: "#005c4b",
        cursorColor: "#7ae3c3",
        barWidth: 2,
        height: 30,
        responsive: true,
      });

      waveForm.current.on("finish", () => {
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
      const audioURL = `${HOST}/${message.message}`;
      const audio = new Audio(audioURL);
      setAudioMessage(audio);

      waveForm.current.load(audioURL);
      waveForm.current.on("ready", () => {
        setTotalDuration(waveForm.current.getDuration());
      });
    };

    loadAudio();
  }, [message.message]);

  // ▶ Play recorded audio
  const handlePlayAudio = () => {
    if (audioMessage) {
      waveForm.current.stop();
      waveForm.current.play();
      // audioMessage.play();
      setIsPlaying(true);
    }
  };

  // ⏸ Pause playback
  const handlePauseAudio = () => {
    if (audioMessage) {
      waveForm.current.stop();
      audioMessage.pause();
    }
    setIsPlaying(false);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      className={`flex items-center gap-5 text-white px-4 pr-2 py-4 text-sm rounded-md ${
        message.senderId === currentChatUser.id
          ? "bg-incoming-background"
          : "bg-outgoing-background"
      }`}
    >
      <div>
        <Avatar type={"lg"} image={currentChatUser?.profilePicture} />
      </div>
      <div className="cursor-pointer text-xl">
        {!isPlaying ? (
          <FaPlay onClick={handlePlayAudio} title="Play audio" />
        ) : (
          <FaStop onClick={handlePauseAudio} title="Pause audio" />
        )}
      </div>
      <div className="relative">
        <div className="w-60" ref={waveFormRef} />
        <div className="text-bubble-meta text-[11px] pt-1 flex justify-between absolute bottom-[-22px] w-full">
          <span>
            {formatTime(isPlaying ? currentPlayBackTime : totalDuration)}
          </span>
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
