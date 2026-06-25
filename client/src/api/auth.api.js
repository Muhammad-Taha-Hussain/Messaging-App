import apiClient from '@/lib/api-client';
import {
  CHECK_USER_ROUTE,
  GET_ALL_CONTACTS,
  GET_CALL_TOKENS,
  ONBOARD_USER_ROUTE,
} from '@/utils/api-routes';

export async function checkUser(emailOrPayload) {
  const email =
    typeof emailOrPayload === 'string' ? emailOrPayload : emailOrPayload?.email;

  const { data } = await apiClient.post(CHECK_USER_ROUTE, { email });
  return data;
}

export async function onboardUser(payload) {
  const { data } = await apiClient.post(ONBOARD_USER_ROUTE, payload);
  return data;
}

export async function editOnboardUser({id, payload}) {
  const { data } = await apiClient.patch(`${ONBOARD_USER_ROUTE}/${id}`, payload);
  return data;
}

export async function fetchAllContacts() {
  const {
    data: { users },
  } = await apiClient.get(GET_ALL_CONTACTS);
  return users;
}

export async function fetchCallTokens(userId) {
  const {
    data: { token },
  } = await apiClient.get(`${GET_CALL_TOKENS}/${userId}`);
  return token;
}
