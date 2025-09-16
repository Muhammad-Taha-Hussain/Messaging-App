import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FaCamera } from "react-icons/fa";
import ContextMenu from "./ContextMenu";
import PhotoPicker from "./PhotoPicker";
import PhotoLibrary from "./PhotoLibrary";
import CapturePhoto from "./CapturePhoto";

function Avatar({ type, image, setImage }) {
  const [hover, setHover] = useState(false);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [grabPhoto, setGrabPhoto] = useState(false);
  const [showPhotoLibrary , setShowPhotoLibrary] = useState(false);
  const [showCapturePhoto , setShowCapturePhoto] = useState(false);
  const [contextMenuCoordinates, setContextMenuCoordinates] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (grabPhoto) {
      const data = document.getElementById("photo-picker");
      data.click();
      document.body.onfocus = (e) => {
        setTimeout(() => {
          setGrabPhoto(false);
        }, 1000);
      };
    }
  }, [grabPhoto]);

  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuCoordinates({ x: e.pageX, y: e.pageY });
    setIsContextMenuVisible(true);
  };
  console.log(setContextMenuCoordinates);

  const contextMenuOptions = [
    {
      name: "Take Photo",
      callback: () => {
        setShowCapturePhoto(true);
      },
    },
    {
      name: "Choose From Library",
      callback: () => {
        setShowPhotoLibrary(true);
      },
    },
    {
      name: "Upload Photo",
      callback: () => {
        setGrabPhoto(true);
      },
    },
    {
      name: "Remove Photo",
      callback: () => {
        setImage("/default_avatar.png");
      },
    },
  ];

  const photoPickerChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      const data = document.createElement("img");
      reader.onload = (event) => {
        data.src = event.target.result;
        data.setAttribute("data-src", event.target.result);
        reader.readAsDataURL(file);
        setTimeout(() => {
          setImage(data.src);
        }, 100);
        
        setGrabPhoto(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center">
        {type == "sm" && (
          <div className="relative h-8 w-8">
            <Image src={image} className="rounded-full" fill alt="avatar" />
          </div>
        )}
        {type == "lg" && (
          <div className="relative h-12 w-12">
            <Image src={image} className="rounded-full" fill alt="avatar" />
          </div>
        )}
        {type == "xl" && (
          <div
            className="relative cursor-pointer z-0 rounded-full"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            id="context-opener"

          >
            <div
              className={`bg-photopicker-overlay-background h-60 w-60 absolute z-10 ${
                hover ? "visible" : "hidden"
              } rounded-full flex flex-col items-center justify-center`}
              onClick={(e) => showContextMenu(e)}
            >
              <FaCamera
                className="text-2xl"
                onClick={(e) => showContextMenu(e)}
              />
              <span onClick={(e) => showContextMenu(e)}>
                Change Profile Photo
              </span>
            </div>
            <div className=" flex items-center justify-center h-60 w-60">
              <Image
                src={image}
                className="rounded-full p-4"
                fill
                alt="avatar"
              />
            </div>
          </div>
        )}
      </div>
      {isContextMenuVisible && (
        <ContextMenu
          options={contextMenuOptions}
          coordinates={contextMenuCoordinates}
          contextMenu={isContextMenuVisible}
          setContextMenu={setIsContextMenuVisible}
        />
      )}

      {showCapturePhoto  && (<CapturePhoto setImage={setImage} hide={setShowCapturePhoto} />)}
      {showPhotoLibrary  && (<PhotoLibrary setImage={setImage} hidePhotoLibrary={setShowPhotoLibrary} />)}
      {grabPhoto && <PhotoPicker onChange={photoPickerChange} />}
    </>
  );
}

export default Avatar;
