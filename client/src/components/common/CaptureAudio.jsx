import { useStateProvider } from "@/context/StateContext";
import React, { useEffect, useRef, useState } from "react";
import {
  FaMicrophone,
  FaPauseCircle,
  FaPlay,
  FaStop,
  FaTrash,
} from "react-icons/fa";
import { MdSend } from "react-icons/md";
import WaveSurfer from "wavesurfer.js";
import { ADD_AUDIO_MESSAGE_ROUTE, ADD_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import { reducerCases } from "@/context/constants";


function CaptureAudio({ hide }) {
  const [{ userInfo, currentChatUser, socket }, dispatch] = useStateProvider();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [waveForm, setWaveForm] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentPlayBackTime, setCurrentPlayBackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [renderedAudio, setRenderedAudio] = useState(null);


  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const waveFormRef = useRef(null);
  const audioChunksRef = useRef([]); // store chunks properly

  // Setup waveform once
  useEffect(() => {
    const waveSurfer = WaveSurfer.create({
      container: waveFormRef.current,
      waveColor: "#ccc",
      progressColor: "#005c4b",
      cursorColor: "#7ae3c3",
      barWidth: 2,
      height: 30,
      responsive: true,
    });

    setWaveForm(waveSurfer);

    waveSurfer.on("finish", () => {
      setIsPlaying(false);
    });

    return () => {
      waveSurfer.destroy();
    };
  }, []);

  // Timer for recording
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
        setTotalDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Track playback time
  useEffect(() => {
    if (recordedAudio) {
      const updateTime = () =>
        setCurrentPlayBackTime(recordedAudio.currentTime);
      recordedAudio.addEventListener("timeupdate", updateTime);
      return () => {
        recordedAudio.removeEventListener("timeupdate", updateTime);
      };
    }
  }, [recordedAudio]);

  // 🎤 Start Recording
  const handleStartRecording = () => {
    setRecordingDuration(0);
    setCurrentPlayBackTime(0);
    setTotalDuration(0);
    setIsRecording(true);
    setRecordedAudio(null);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        audioRef.current.srcObject = stream;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const audioURL = URL.createObjectURL(blob);
          const audio = new Audio(audioURL);
          setRecordedAudio(audio);
          waveForm.load(audioURL);
          setRenderedAudio(
            new File([blob], "recording.webm", { type: "audio/webm" })
          );
        };

        mediaRecorder.start();
      })
      .catch((error) => {
        console.error("Error accessing mic:", error);
      });
  };

  // ⏹ Stop Recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      waveForm.stop();
    }
  };

  // ▶ Play recorded audio
  const handlePlayRecording = () => {
    if (recordedAudio) {
      waveForm.stop();
      waveForm.play();
      recordedAudio.play();
      setIsPlaying(true);
    }
  };

  // ⏸ Pause playback
  const handlePauseRecording = () => {
    if (recordedAudio) {
      recordedAudio.pause();
      waveForm.stop();
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

  const hideAudioComponent = () => {
    // Stop playback if active
    if (recordedAudio) {
      recordedAudio.pause();
      recordedAudio.currentTime = 0; // reset to start
    }
    if (waveForm) {
      waveForm.stop();
    }

    // Stop recording stream if active
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (audioRef.current && audioRef.current.srcObject) {
      const tracks = audioRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop()); // release mic
      audioRef.current.srcObject = null;
    }

    // Reset states
    setIsRecording(false);
    setIsPlaying(false);
    setRecordedAudio(null);
    setRenderedAudio(null);
    setRecordingDuration(0);
    setCurrentPlayBackTime(0);
    setTotalDuration(0);

    hide(false);
  };

    const sendRecording = async (e) => {
      try {
        const formData = new FormData();
        console.log("audio", renderedAudio);
  
        formData.append("audio", renderedAudio);
        console.log(formData);
  
        const response = await axios.post(ADD_AUDIO_MESSAGE_ROUTE, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          params: {
            from: userInfo.id,
            to: currentChatUser.id,
          },
        });
        console.log(response);
  
        if (response.status === 201) {
          socket.current.emit("send-msg", {
            from: userInfo?.id,
            to: currentChatUser?.id,
            message: response.data.message,
          });
          dispatch({
            type: reducerCases.ADD_MESSAGE,
            newMessage: {
              ...response.data.message,
            },
            fromSelf: true,
          });
        }
        // if (file) {
        //   const reader = new FileReader();
        //   const data = document.createElement("img");
        //   reader.onload = (event) => {
        //     data.src = event.target.result;
        //     data.setAttribute("data-src", event.target.result);
        //     reader.readAsDataURL(file);
        //     setTimeout(() => {
        //       setImage(data.src);
        //     }, 100);
  
        //     setGrabPhoto(false);
        //   };
        //   reader.readAsDataURL(file);
        // }
      } catch (error) {
        console.log(error);
      }
    };

  return (
    <div className="flex text-2xl w-full justify-end items-center">
      <FaTrash
        className="text-panel-header-icon cursor-pointer"
        onClick={hideAudioComponent}
        title="Trash Recording"
      />

      <div className="mx-6 px-4 py-2 text-white text-lg flex gap-3 justify-center items-center bg-search-input-container-background rounded-full drop-shadow-lg">
        {isRecording ? (
          <div className="text-red-500 animate-pulse text-center">
            Recording <span>{recordingDuration}s</span>
          </div>
        ) : (
          recordedAudio &&
          (!isPlaying ? (
            <FaPlay onClick={handlePlayRecording} title="Start Recording" />
          ) : (
            <FaPauseCircle
              onClick={handlePauseRecording}
              title="Stop Recording"
            />
          ))
        )}

        <div className="w-60" ref={waveFormRef} hidden={isRecording} />
        {recordedAudio && (
          <span>
            {isPlaying
              ? formatTime(currentPlayBackTime)
              : formatTime(totalDuration)}
          </span>
        )}
        <audio ref={audioRef} hidden />
      </div>

      <div className="mr-4">
        {!isRecording ? (
          <FaMicrophone
            className="text-red-500"
            onClick={handleStartRecording}
            title="Start Recording"
          />
        ) : (
          <FaStop
            className="text-red-500"
            onClick={handleStopRecording}
            title="Stop Recording"
          />
        )}
      </div>

      <MdSend
        className="text-panel-header-icon cursor-pointer mr-4"
        onClick={sendRecording}
        title={recordedAudio && "Send Recording"}
      />
    </div>
  );
}

export default CaptureAudio;
