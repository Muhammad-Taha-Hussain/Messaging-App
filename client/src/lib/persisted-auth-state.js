export function getPersistedAuthState() {
  if (typeof window === 'undefined') {
    return { userInfo: undefined, newUser: false };
  }

  try {
    const storedUserInfo = localStorage.getItem('userInfo');
    const storedNewUser = localStorage.getItem('newUser');

    return {
      userInfo: storedUserInfo ? JSON.parse(storedUserInfo) : undefined,
      newUser: storedNewUser ? JSON.parse(storedNewUser) : false,
    };
  } catch {
    return { userInfo: undefined, newUser: false };
  }
}

export function clearPersistedAuthState() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('userInfo');
  localStorage.removeItem('newUser');
}
