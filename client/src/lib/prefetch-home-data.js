import { cookies } from 'next/headers';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/query-keys';
import { resolveApiHost } from '@/lib/resolve-api-host';

async function serverCheckUser(email) {
  const host = resolveApiHost();
  const response = await fetch(`${host}/api/auth/check-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to verify user on server');
  }

  return response.json();
}

async function serverFetchInitialContacts(userId) {
  const host = resolveApiHost();
  const response = await fetch(`${host}/api/message/get-initial-contacts/${userId}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch initial contacts on server');
  }

  const { users, onlineUsers } = await response.json();

  return { users, onlineUsers };
}

export async function prefetchHomeData() {
  const cookieStore = cookies();
  const userEmail = cookieStore.get('userEmail')?.value;

  if (!userEmail) {
    return { dehydratedState: undefined, userInfo: undefined };
  }

  const email = decodeURIComponent(userEmail);
  const queryClient = new QueryClient();

  try {
    const authData = await queryClient.fetchQuery({
      queryKey: queryKeys.auth.checkUser(email),
      queryFn: () => serverCheckUser(email),
    });

    if (!authData?.status || !authData?.data) {
      return { dehydratedState: undefined, userInfo: undefined };
    }

    const { id, email: verifiedEmail, name, profilePicture: profileImage, status } = authData.data;
    const userInfo = {
      id,
      name,
      email: verifiedEmail,
      profileImage,
      status,
    };

    await queryClient.prefetchQuery({
      queryKey: queryKeys.contacts.initial(id),
      queryFn: () => serverFetchInitialContacts(id),
    });

    return {
      dehydratedState: dehydrate(queryClient),
      userInfo,
    };
  } catch {
    return { dehydratedState: undefined, userInfo: undefined };
  }
}
