import { useMutation, useQuery } from '@tanstack/react-query';
import {
  fetchMessages,
  sendAudioMessage,
  sendImageMessage,
  sendTextMessage,
} from '@/api/messages.api';
import { queryKeys } from '@/api/query-keys';

export function useMessages(userId, chatUserId) {
  return useQuery({
    queryKey: queryKeys.messages.conversation(userId, chatUserId),
    queryFn: () => fetchMessages(userId, chatUserId),
    enabled: Boolean(userId && chatUserId),
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  });
}

export function useSendTextMessage() {
  return useMutation({
    mutationFn: sendTextMessage,
  });
}

export function useSendImageMessage() {
  return useMutation({
    mutationFn: sendImageMessage,
  });
}

export function useSendAudioMessage() {
  return useMutation({
    mutationFn: sendAudioMessage,
  });
}
