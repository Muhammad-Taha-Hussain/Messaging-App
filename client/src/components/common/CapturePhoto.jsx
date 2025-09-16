import React, { useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";

function CapturePhoto({ hide, setImage }) {
  const videoRef = useRef(null);
  useEffect(() => {
    let stream;
    const startVideo = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing webcam: ", error);
      }
    };
    startVideo();
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL("image/jpeg");
    console.log({ imageDataUrl });
    
    setImage(imageDataUrl);
    hide(false);
  };
  return (
    <div className="absolute h-5/6 w-2/6 top-20 left-1/3 bg-gray-900 rounded-lg flex items-center justify-center">
      <div className="flex flex-col gap-2 w-full">
        <div className="pt-2 pr-2 cursor-pointer flex items-start justify-end">
          <IoClose
            className="h-10 w-10 text-white "
            onClick={() => hide(false)}
          />
        </div>
        <div className=" flex justify-center">
          <video
            ref={videoRef}
            id="video"
            width={400}
            height={400}
            autoPlay
            src=""
            onClick={capturePhoto}
          ></video>
        </div>
        <button className="h-16 w-16 bg-white rounded-full cursor-pointer border-8 border-teal-light p-2 mb-10 self-center" onClick={capturePhoto}></button>
      </div>
    </div>
  );
}

export default CapturePhoto;
