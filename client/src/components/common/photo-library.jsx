import Image from 'next/image';
import React from 'react';
import { IoClose } from 'react-icons/io5';

function PhotoLibrary({ hidePhotoLibrary, setImage }) {
  const images = [
    '/avatars/1.png',
    '/avatars/2.png',
    '/avatars/3.png',
    '/avatars/4.png',
    '/avatars/5.png',
    '/avatars/6.png',
    '/avatars/7.png',
    '/avatars/8.png',
    '/avatars/9.png',
  ];
  return (
    <div className="fixed top-0 left-0 flex max-h-[100vh] max-w-[100vw] h-full w-full items-center justify-center">
      <div className="h-max w-max bg-gray-900 gap-6 rounded-lg p-4">
        <div className="pt-2 pe-2 cursor-pointer flex items-end justify-end">
          <IoClose
            className="h-10 w-10 text-white "
            onClick={() => hidePhotoLibrary(false)}
          />
        </div>
        <div className="grid grid-cols-3 justify-center items-center gap-2 p-20 w-full">
          {images.map((img) => (
            <div
              key={img}
              className="h-32 w-32 rounded-full cursor-pointer hover:scale-105 transition-all"
              onClick={() => {
                setImage(img);
                hidePhotoLibrary(false);
              }}
            >
              <div className="h-24 w-24 cursor-pointer rounded-full overflow-hidden relative">
                <Image
                  src={img}
                  alt={`avatar-${img.split('/').pop()?.replace('.png', '')}`}
                  className="object-cover rounded-full"
                  fill
                  sizes="96px"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PhotoLibrary;
