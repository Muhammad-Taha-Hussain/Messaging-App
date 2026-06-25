import { useQuery } from '@tanstack/react-query';
import { fetchCallTokens } from '@/api/auth.api';
import { queryKeys } from '@/api/query-keys';

export function useCallTokens(userId, enabled = true) {
  return useQuery({
    queryKey: queryKeys.calls.tokens(userId),
    queryFn: () => fetchCallTokens(userId),
    enabled: !!userId,
    staleTime: 0,
    gcTime: 0,
  });
}
