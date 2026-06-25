import { reducerCases } from '@/context/constants';
import { useStateProvider } from '@/context/state-context';
import { useAllContacts } from '@/hooks/use-contacts-api';
import React, { useEffect, useState } from 'react';
import { BiArrowBack, BiSearchAlt2 } from 'react-icons/bi';
import ChatListItem from './chat-list-item';

function ContactsList() {
  const [, dispatch] = useStateProvider();
  const { data: allContacts = {} } = useAllContacts();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchContacts, setSearchContacts] = useState([]);

  useEffect(() => {
    if (searchTerm.length) {
      const filteredData = {};
      Object.keys(allContacts).forEach((key) => {
        filteredData[key] = allContacts[key].filter((obj) =>
          obj.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setSearchContacts(filteredData);
    } else {
      setSearchContacts(allContacts);
    }
  }, [allContacts, searchTerm]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-end px-3 py-4">
        <div className="flex items-center gap-12 text-white font-semibold text-lg">
          <BiArrowBack
            className="text-xl cursor-pointer"
            onClick={() => dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE })}
          />
          <span>New Chat</span>
        </div>
      </div>
      <div className="bg-search-input-container-background flex-auto overflow-auto custom-scrollbar">
        <div className="flex py-3 items-center gap-3 h-14">
          <div className="bg-panel-header-background mx-4 flex items-center gap-5 px-3 py-1 rounded-lg flex-grow">
            <BiSearchAlt2 className="text-panel-header-icon cursor-pointer text-xl" />
            <div className="w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Contacts"
                className="bg-transparent text-white text-sm focus:outline-none placeholder:text-search-input-placeholder-text w-full"
              />
            </div>
          </div>
        </div>
        {Object.entries(searchContacts).map(([initialLetter, userList]) =>
          userList.length > 0 ? (
            <div key={initialLetter} className="flex gap-2 px-2 items-start">
              <div className="text-teal-light pl-6 pt-5 w-10 shrink-0">{initialLetter}</div>
              <div className="flex min-w-0 flex-1 flex-col">
                {userList.map((contact) => (
                  <ChatListItem key={contact.id} data={contact} isPageContact />
                ))}
              </div>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

export default ContactsList;
