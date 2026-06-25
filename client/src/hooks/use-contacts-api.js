import { useQuery } from '@tanstack/react-query';
import { fetchAllContacts } from '@/api/auth.api';
import { fetchInitialContacts } from '@/api/messages.api';
import { queryKeys } from '@/api/query-keys';

export function useInitialContacts(userId) {
  return useQuery({
    queryKey: queryKeys.contacts.initial(userId),
    queryFn: () => fetchInitialContacts(userId),
    enabled: Boolean(userId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useAllContacts() {
  return useQuery({
    queryKey: queryKeys.contacts.allUsers,
    queryFn: fetchAllContacts,
    staleTime: 5 * 60 * 1000,
  });
}
