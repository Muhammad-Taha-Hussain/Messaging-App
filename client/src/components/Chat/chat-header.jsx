import React, { useState } from 'react';
import Avatar from '@/components/common/Avatar';
import { useStateProvider } from '@/context/state-context';
import { MdCall } from 'react-icons/md';
import { IoVideocam } from 'react-icons/io5';
import { BiSearchAlt2 } from 'react-icons/bi';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { reducerCases } from '@/context/constants';
import ContextMenu from '../common/context-menu';

function ChatHeader() {
  const [{ currentChatUser, onlineUsers }, dispatch] = useStateProvider();
  const [contextMenuCoordinates, setContextMenuCoordinates] = useState({
    x: 0,
    y: 0,
  });
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);

  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuCoordinates({ x: e.pageX - 50, y: e.pageY + 20 });
    setIsContextMenuVisible(true);
  };

  const contextMenuOptions = [
    {
      name: 'Exit',
      callback: async () => {
        setIsContextMenuVisible(false);
        dispatch({ type: reducerCases.SET_EXIT_CHAT });
      },
    },
  ];

  return (
    <div className="h-16 px-4 py-3 flex justify-between items-center bg-panel-header-background z-10">
      <div className="flex items-center justify-center gap-6">
        <Avatar type="sm" image={currentChatUser?.profilePicture} />
        <div className="flex flex-col">
          <span className="text-primary-strong">{currentChatUser?.name}</span>
          <span className="text-secondary text-sm">
            {onlineUsers.includes(currentChatUser.id) ? 'online' : 'offline'}
          </span>
        </div>
      </div>
      <div className="flex gap-6">
        <MdCall
          className="text-panel-header-icon cursor-pointer text-xl"
          title="Voice Call"
          onClick={() =>
            dispatch({
              type: reducerCases.SET_VOICE_CALL,
              voiceCall: {
                ...currentChatUser,
                type: 'out-going',
                callType: 'voice',
                roomId: Date.now(),
              },
            })
          }
        />
        <IoVideocam
          className="text-panel-header-icon cursor-pointer text-xl"
          title="Video Call"
          onClick={() =>
            dispatch({
              type: reducerCases.SET_VIDEO_CALL,
              videoCall: {
                ...currentChatUser,
                type: 'out-going',
                callType: 'video',
                roomId: Date.now(),
              },
            })
          }
        />
        <BiSearchAlt2
          className="text-panel-header-icon cursor-pointer text-xl"
          title="Search"
          onClick={() => dispatch({ type: reducerCases.SET_SEARCH_MESSAGE })}
        />
        <BsThreeDotsVertical
          className="text-panel-header-icon cursor-pointer text-xl"
          title="Menu"
          onClick={(e) => showContextMenu(e)}
          id="context-opener"
        />
        {isContextMenuVisible && (
          <ContextMenu
            options={contextMenuOptions}
            coordinates={contextMenuCoordinates}
            contextMenu={isContextMenuVisible}
            setContextMenu={setIsContextMenuVisible}
          />
        )}
      </div>
    </div>
  );
}

export default ChatHeader;
