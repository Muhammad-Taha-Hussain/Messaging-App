import React, { useEffect, useState } from 'react';
import ChatListHeader from './chat-list-header';
import SearchBar from './search-bar';
import List from './list';
import { useStateProvider } from '@/context/state-context';
import ContactsList from './contacts-list';

function ChatList() {
  const [{ contactsPage }] = useStateProvider();
  const [pageType, setPageType] = useState('default');

  useEffect(() => {
    setPageType(contactsPage ? 'all-contacts' : 'default');
  }, [contactsPage]);

  return (
    <div className="bg-panel-header-background flex flex-col max-h-screen z-20">
      {pageType === 'default' && (
        <>
          <ChatListHeader />
          <SearchBar />
          <List />
        </>
      )}
      {pageType === 'all-contacts' && <ContactsList />}
    </div>
  );
}

export default ChatList;
