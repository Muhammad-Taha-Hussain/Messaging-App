import { useStateProvider } from '@/context/state-context';
import { resolveMediaUrl } from '@/utils/resolve-media-url';
import Image from 'next/image';
import React, { useState } from 'react';
import MessageStatus from '../common/message-status';
import { calculateTime } from '@/utils/calculate-time';
import FullScreenModal from '../common/full-screen-modal';

function ImageMessage({ message }) {
  const [{ currentChatUser, userInfo }] = useStateProvider();
  const [showFullScreenModal, setShowFullScreenModal] = useState(false);
  const imageSrc = resolveMediaUrl(message.message);

  return (
    <div
      className={`p-1 rounded-lg ${
        message.senderId === currentChatUser.id
          ? 'bg-incoming-background'
          : 'bg-outgoing-background'
      }`}
    >
      <div
        className="relative cursor-pointer"
        style={{
          width: 'auto',
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
        onClick={() => setShowFullScreenModal(true)}
      >
        <Image
          src={imageSrc}
          className="rounded-lg"
          alt="asset"
          height={300}
          width={300}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div className="absolute bottom-1 right-1 flex items-end gap-1">
          <span className="text-bubble-meta text-[11px] pt-1 min-w-fit">
            {calculateTime(message.createdAt)}
          </span>
          <span className="text-bubble-meta">
            {message.senderId === userInfo.id && (
              <MessageStatus MessageStatus={message.messageStatus} />
            )}
          </span>
        </div>
      </div>
      {showFullScreenModal && (
        <FullScreenModal onClose={() => setShowFullScreenModal(false)}>
          <div
            style={{
              width: 500,
              height: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              src={imageSrc}
              alt="asset"
              className="rounded-lg object-cover"
              width={500}
              height={500}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        </FullScreenModal>
      )}
    </div>
  );
}

export default ImageMessage;
