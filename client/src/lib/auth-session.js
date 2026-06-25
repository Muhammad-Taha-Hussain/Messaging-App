const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function setAuthSessionCookie(userInfo) {
  if (typeof document === 'undefined' || !userInfo?.id || !userInfo?.email) {
    return;
  }

  const cookieOptions = `path=/; max-age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax`;
  document.cookie = `userId=${encodeURIComponent(userInfo.id)}; ${cookieOptions}`;
  document.cookie = `userEmail=${encodeURIComponent(userInfo.email)}; ${cookieOptions}`;
}

export function clearAuthSessionCookie() {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = 'userId=; path=/; max-age=0';
  document.cookie = 'userEmail=; path=/; max-age=0';
}
