import apiClient from '@/lib/api-client';
import {
  ADD_AUDIO_MESSAGE_ROUTE,
  ADD_IMAGE_MESSAGE_ROUTE,
  ADD_MESSAGE_ROUTE,
  GET_INITIAL_CONTACTS_ROUTE,
  GET_MESSAGE_ROUTE,
} from '@/utils/api-routes';

export async function fetchInitialContacts(userId) {
  const {
    data: { users, onlineUsers },
  } = await apiClient.get(`${GET_INITIAL_CONTACTS_ROUTE}/${userId}`);
  return { users, onlineUsers };
}

export async function fetchMessages(userId, chatUserId) {
  const {
    data: { messages },
  } = await apiClient.get(`${GET_MESSAGE_ROUTE}/${userId}/${chatUserId}`);
  return messages;
}

export async function sendTextMessage({ from, to, message }) {
  const { data } = await apiClient.post(ADD_MESSAGE_ROUTE, {
    from,
    to,
    message,
  });
  return data.message;
}

export async function sendImageMessage({ from, to, file }) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiClient.post(ADD_IMAGE_MESSAGE_ROUTE, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: { from, to },
  });

  return response.data.message;
}

export async function sendAudioMessage({ from, to, audio }) {
  const formData = new FormData();
  formData.append('audio', audio);

  const response = await apiClient.post(ADD_AUDIO_MESSAGE_ROUTE, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: { from, to },
  });

  return response.data.message;
}
