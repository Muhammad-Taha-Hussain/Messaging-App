import React from 'react';
import Avatar from '../common/avatar';
import { useStateProvider } from '@/context/state-context';
import { reducerCases } from '@/context/constants';
import { calculateTime } from '@/utils/calculate-time';
import MessageStatus from '../common/message-status';
import { FaCamera, FaMicrophone } from 'react-icons/fa';

function ChatListItem({ data, isPageContact = false }) {
  const [{ userInfo }, dispatch] = useStateProvider();

  return (
    <div
      className="flex items-center cursor-pointer hover:bg-background-default-hover"
      onClick={() => {
        if (!isPageContact) {
          dispatch({
            type: reducerCases.CHANGE_CURRENT_CHAT_USER,
            user: {
              name: data.name,
              about: data.about,
              profilePicture: data.profilePicture,
              email: data.email,
              id: userInfo.id === data?.senderId ? data.receiverId : data.senderId,
            },
          });
        } else {
          dispatch({
            type: reducerCases.CHANGE_CURRENT_CHAT_USER,
            user: { ...data },
          });
          dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE });
        }
      }}
    >
      <div className="min-w-fit px-2 pt-3 pb-1">
        <Avatar type="lg" image={data?.profilePicture} />
      </div>
      <div className="min-h-full flex flex-col justify-center mt-3 pr-2 w-full">
        <div className="flex justify-between">
          <span className="text-white">{data?.name}</span>
          {!isPageContact && (
            <span
              className={`${
                data.totalUnreadMessages > 0 ? 'text-icon-green' : 'text-secondary'
              } text-sm`}
            >
              {calculateTime(data.createdAt)}
            </span>
          )}
        </div>
        <div className="flex border-b border-conversation-border pb-2 pt-1 pl-3">
          <div className="flex justify-between w-full">
            <span className="text-secondary line-clamp-1 text-sm">
              {isPageContact ? (
                data?.about || '\u00A0'
              ) : (
                <div className="flex items-center gap-1 max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[200px] xl:max-w-[300px]">
                  {data.senderId === userInfo.id && (
                    <MessageStatus MessageStatus={data.messageStatus} />
                  )}
                  {data.type === 'text' && (
                    <span className="truncate">{data.message}</span>
                  )}
                  {data.type === 'image' && (
                    <span className="flex gap-1 items-center">
                      <FaCamera className="text-panel-header-icon" /> Image
                    </span>
                  )}
                  {data.type === 'audio' && (
                    <span className="flex gap-1 items-center">
                      <FaMicrophone className="text-panel-header-icon" /> Audio
                    </span>
                  )}
                </div>
              )}
            </span>
            {data.totalUnreadMessages > 0 && (
              <span className="bg-icon-green px-[7px] rounded-full text-sm text-white font-semibold">
                {data.totalUnreadMessages}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatListItem;
