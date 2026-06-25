import React, { useState } from 'react';
import Avatar from '../common/Avatar';
import { useStateProvider } from '@/context/state-context';
import { BsFillChatLeftTextFill, BsThreeDotsVertical } from 'react-icons/bs';
import ContextMenu from '../common/context-menu';
import { reducerCases } from '@/context/constants';
import { signOutUser } from '@/lib/sign-out';
import { useRouter } from 'next/navigation';

function ChatListHeader() {
  const router = useRouter();
  const [{ userInfo, socket }, dispatch] = useStateProvider();
  const [contextMenuCoordinates, setContextMenuCoordinates] = useState({
    x: 0,
    y: 0,
  });
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);

  const showContextMenu = (e) => {
    e.preventDefault();
    setIsContextMenuVisible(true);
    setContextMenuCoordinates({ x: e.pageX - 50, y: e.pageY + 20 });
  };

  return (
    <div className="h-16 px-4 py-3 flex justify-between items-center">
      <div className="cursor-pointer" onClick={() => router.push('/onboarding?mode=edit')}>
        <Avatar type="sm" image={userInfo?.profileImage} />
      </div>
      <div className="flex gap-6 p-4">
        <BsFillChatLeftTextFill
          className="text-panel-header-icon cursor-pointer text-xl"
          title="New Chat"
          onClick={() => dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE })}
        />
        <BsThreeDotsVertical
          className="text-panel-header-icon cursor-pointer text-xl rounded-full"
          title="Menu"
          onClick={(e) => showContextMenu(e)}
          id="context-opener"
        />
        {isContextMenuVisible && (
          <ContextMenu
            options={[
              {
                name: 'Logout',
                callback: async () => {
                  setIsContextMenuVisible(false);
                  dispatch({ type: reducerCases.SET_EXIT_CHAT });

                  if (socket?.current && userInfo?.id) {
                    socket.current.emit('signout', userInfo.id);
                  }

                  dispatch({ type: reducerCases.SET_USER_INFO, userInfo: undefined });
                  dispatch({ type: reducerCases.SET_NEW_USER, newUser: false });
                  await signOutUser();
                  router.replace('/login');
                },
              },
            ]}
            coordinates={contextMenuCoordinates}
            contextMenu={isContextMenuVisible}
            setContextMenu={setIsContextMenuVisible}
          />
        )}
      </div>
    </div>
  );
}

export default ChatListHeader;
