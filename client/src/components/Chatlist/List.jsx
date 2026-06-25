import { reducerCases } from '@/context/constants';
import { useStateProvider } from '@/context/state-context';
import { useInitialContacts } from '@/hooks/use-contacts-api';
import React, { useEffect } from 'react';
import ChatListItem from './chat-list-item';

function List() {
  const [{ userInfo, userContacts, filteredContacts }, dispatch] = useStateProvider();
  const { data } = useInitialContacts(userInfo?.id);

  useEffect(() => {
    if (data) {
      dispatch({ type: reducerCases.SET_USER_CONTACTS, userContacts: data.users });
      dispatch({ type: reducerCases.SET_ONLINE_USERS, onlineUsers: data.onlineUsers });
    }
  }, [data, dispatch]);

  return (
    <div className="bg-search-input-container-background flex-auto overflow-auto max-h-full custom-scrollbar">
      {(filteredContacts && filteredContacts.length > 0
        ? filteredContacts
        : userContacts
      ).map((contact) => (
        <ChatListItem data={contact} key={contact.id} />
      ))}
    </div>
  );
}

export default List;
