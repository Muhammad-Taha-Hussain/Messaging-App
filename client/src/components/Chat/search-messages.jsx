import { reducerCases } from '@/context/constants';
import { useStateProvider } from '@/context/state-context';
import { calculateTime } from '@/utils/calculate-time';
import React, { useEffect, useState } from 'react';
import { BiSearchAlt2 } from 'react-icons/bi';
import { IoClose } from 'react-icons/io5';

function SearchMessages() {
  const [{ currentChatUser, allMessages }, dispatch] = useStateProvider();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedMessages, setSearchedMessages] = useState([]);

  useEffect(() => {
    if (searchTerm) {
      setSearchedMessages(
        allMessages.filter(
          (allMessage) =>
            allMessage.type === 'text' && allMessage.message.includes(searchTerm)
        )
      );
    } else {
      setSearchedMessages([]);
    }
  }, [allMessages, searchTerm]);

  return (
    <div className="border-conversation-border border-l w-full bg-conversation-panel-background flex flex-col z-10 max-h-screen">
      <div className="h-16 px-4 py-5 flex gap-10 items-center bg-panel-header-background text-primary-strong">
        <IoClose
          className="cursor-pointer text-icon-lighter text-2xl"
          onClick={() => dispatch({ type: reducerCases.SET_SEARCH_MESSAGE })}
        />
        <span>Search Messages</span>
      </div>
      <div className="h-full overflow-auto custom-scrollbar">
        <div className="flex items-center flex-col w-full">
          <div className="flex px-5 items-center gap-3 h-14 w-full">
            <div className="bg-panel-header-background flex items-center w-full gap-5 px-3 py-1 rounded-lg">
              <BiSearchAlt2 className="text-panel-header-icon cursor-pointer text-xl" />
              <input
                type="text"
                placeholder="Search Messages"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-white text-sm focus:outline-none placeholder:text-search-input-placeholder-text w-full"
              />
            </div>
          </div>
          <span className="mt-2 text-secondary w-3/4 flex items-center justify-center">
            {!searchTerm.length && `Search for messages with ${currentChatUser.name}`}
          </span>
        </div>
        <div className="flex justify-center h-full flex-col">
          {searchTerm.length > 0 && !searchedMessages.length && (
            <span className="text-secondary w-full flex justify-center">
              No messages found
            </span>
          )}
          <div className="flex flex-col w-full h-full">
            {searchedMessages.map((message) => (
              <div
                key={message.id ?? `${message.createdAt}-${message.message}`}
                className="flex cursor-pointer flex-col justify-center hover:bg-background-default-hover w-full px-5 border-b-[0.1px] border-secondary py-5"
              >
                <div className="text-sm text-secondary">
                  {calculateTime(message.createdAt)}
                </div>
                <div className="text-icon-green">{message.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchMessages;
