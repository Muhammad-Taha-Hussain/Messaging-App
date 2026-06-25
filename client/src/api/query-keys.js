export const queryKeys = {
  auth: {
    all: ['auth'],
    checkUser: (email) => ['auth', 'check-user', email],
  },
  contacts: {
    all: ['contacts'],
    initial: (userId) => ['contacts', 'initial', userId],
    allUsers: ['contacts', 'all-users'],
  },
  messages: {
    all: ['messages'],
    conversation: (userId, chatUserId) => ['messages', userId, chatUserId],
  },
  calls: {
    all: ['calls'],
    tokens: (userId) => ['calls', 'tokens', userId],
  },
};
