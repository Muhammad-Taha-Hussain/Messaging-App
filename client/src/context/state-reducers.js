import { reducerCases } from './constants';

export const initialState = {
  userInfo: undefined,
  newUser: false,
  contactsPage: false,
  currentChatUser: undefined,
  allMessages: [],
  socket: undefined,
  messagesSearch: false,
  userContacts: [],
  onlineUsers: [],
  filteredContacts: [],
  contactSearch: '',
  videoCall: undefined,
  voiceCall: undefined,
  incomingVoiceCall: undefined,
  incomingVideoCall: undefined,
};

function resolveMessageParticipants(message) {
  const senderId = message?.senderId ?? message?.from;
  const receiverId = message?.receiverId ?? message?.to;
  return { senderId, receiverId };
}

function isSameConversation(a, b) {
  if (!a || !b) return false;
  const aSender = a?.senderId ?? a?.from;
  const aReceiver = a?.receiverId ?? a?.to;
  const bSender = b?.senderId ?? b?.from;
  const bReceiver = b?.receiverId ?? b?.to;
  if (!aSender || !aReceiver || !bSender || !bReceiver) return false;
  return (
    (aSender === bSender && aReceiver === bReceiver) ||
    (aSender === bReceiver && aReceiver === bSender)
  );
}

function upsertAndBumpContact({
  contacts,
  message,
  selfUserId,
  currentChatUserId,
}) {
  if (!Array.isArray(contacts) || contacts.length === 0) return contacts;

  const { senderId, receiverId } = resolveMessageParticipants(message);
  if (!senderId || !receiverId) return contacts;

  const idx = contacts.findIndex((c) => isSameConversation(c, message));
  if (idx === -1) return contacts;

  const existing = contacts[idx];
  const createdAt = message?.createdAt ?? new Date().toISOString();
  const isIncoming = senderId !== selfUserId;
  const shouldIncrementUnread = isIncoming && currentChatUserId !== senderId;

  const updated = {
    ...existing,
    ...message,
    senderId,
    receiverId,
    createdAt,
    totalUnreadMessages: shouldIncrementUnread
      ? (existing?.totalUnreadMessages ?? 0) + 1
      : existing?.totalUnreadMessages ?? 0,
  };

  return [updated, ...contacts.slice(0, idx), ...contacts.slice(idx + 1)];
}

function getContactPeerId(contact, selfUserId) {
  if (!contact || !selfUserId) return undefined;
  return contact.senderId === selfUserId ? contact.receiverId : contact.senderId;
}

function clearContactUnread(contacts, selfUserId, chatUserId) {
  if (!Array.isArray(contacts) || !selfUserId || !chatUserId) return contacts;

  return contacts.map((contact) =>
    getContactPeerId(contact, selfUserId) === chatUserId
      ? { ...contact, totalUnreadMessages: 0 }
      : contact
  );
}

const reducer = (state, action) => {
  switch (action.type) {
    case reducerCases.SET_USER_INFO:
      if (typeof window !== 'undefined') {
        if (action.userInfo) {
          localStorage.setItem('userInfo', JSON.stringify(action.userInfo));
        } else {
          localStorage.removeItem('userInfo');
        }
      }

      return {
        ...state,
        userInfo: action.userInfo,
      };

    case reducerCases.SET_NEW_USER:
      if (typeof window !== 'undefined') {
        localStorage.setItem('newUser', JSON.stringify(action.newUser));
      }

      return {
        ...state,
        newUser: action.newUser,
      };

    case reducerCases.SET_ALL_CONTACTS_PAGE:
      return {
        ...state,
        contactsPage: !state.contactsPage,
      };

    case reducerCases.CHANGE_CURRENT_CHAT_USER:
      return {
        ...state,
        currentChatUser: action.user,
        userContacts: clearContactUnread(
          state.userContacts,
          state.userInfo?.id,
          action.user?.id
        ),
        filteredContacts: clearContactUnread(
          state.filteredContacts,
          state.userInfo?.id,
          action.user?.id
        ),
      };

    case reducerCases.SET_MESSAGES:
      return {
        ...state,
        allMessages: action.messages,
      };

    case reducerCases.SET_SOCKET:
      return {
        ...state,
        socket: action.socket,
      };

    case reducerCases.ADD_MESSAGE:
      return {
        ...state,
        allMessages: [...state.allMessages, action.newMessage],
        userContacts: upsertAndBumpContact({
          contacts: state.userContacts,
          message: action.newMessage,
          selfUserId: state.userInfo?.id,
          currentChatUserId: state.currentChatUser?.id,
        }),
        filteredContacts:
          state.contactSearch && state.contactSearch.trim().length > 0
            ? upsertAndBumpContact({
                contacts: state.filteredContacts,
                message: action.newMessage,
                selfUserId: state.userInfo?.id,
                currentChatUserId: state.currentChatUser?.id,
              })
            : state.filteredContacts,
      };

    case reducerCases.SET_SEARCH_MESSAGE:
      return {
        ...state,
        messagesSearch: !state.messagesSearch,
      };

    case reducerCases.SET_USER_CONTACTS:
      return {
        ...state,
        userContacts: action.userContacts,
      };

    case reducerCases.SET_ONLINE_USERS:
      return {
        ...state,
        onlineUsers: action.onlineUsers,
      };

    case reducerCases.SET_CONTACTS_SEARCH: {
      const filteredContacts = state.userContacts.filter((contact) =>
        contact.name.toLowerCase().includes(action.contactSearch.toLowerCase())
      );

      return {
        ...state,
        contactSearch: action.contactSearch,
        filteredContacts,
      };
    }

    case reducerCases.SET_VIDEO_CALL:
      return {
        ...state,
        videoCall: action.videoCall,
      };

    case reducerCases.SET_VOICE_CALL:
      return {
        ...state,
        voiceCall: action.voiceCall,
      };

    case reducerCases.SET_INCOMING_VOICE_CALL:
      return {
        ...state,
        incomingVoiceCall: action.incomingVoiceCall,
      };

    case reducerCases.SET_INCOMING_VIDEO_CALL:
      return {
        ...state,
        incomingVideoCall: action.incomingVideoCall,
      };

    case reducerCases.END_CALL:
      return {
        ...state,
        voiceCall: undefined,
        videoCall: undefined,
        incomingVoiceCall: undefined,
        incomingVideoCall: undefined,
      };

    case reducerCases.SET_EXIT_CHAT:
      return {
        ...state,
        currentChatUser: undefined,
      };

    default:
      return state;
  }
};

export default reducer;
