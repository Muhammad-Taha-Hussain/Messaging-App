
export const HOST = "http://localhost:3005"

const AUTH_ROUTE = `${HOST}/api/auth`;
const MESSAGE_ROUTE = `${HOST}/api/message`;

//AUTH ROUTES
export const CHECK_USER_ROUTE = `${AUTH_ROUTE}/check-user`;

export const ONBOARD_USER_ROUTE = `${AUTH_ROUTE}/on-board-user`

export const GET_ALL_CONTACTS = `${AUTH_ROUTE}/get-contacts`

export const GET_CALL_TOKENS = `${AUTH_ROUTE}/generate-tokens`

//MESSAGE ROUTES
export const ADD_MESSAGE_ROUTE = `${MESSAGE_ROUTE}/add-message`

export const GET_MESSAGE_ROUTE = `${MESSAGE_ROUTE}/get-messages`

export const ADD_IMAGE_MESSAGE_ROUTE = `${MESSAGE_ROUTE}/add-image-message`

export const ADD_AUDIO_MESSAGE_ROUTE = `${MESSAGE_ROUTE}/add-audio-message`

export const GET_INITIAL_CONTACTS_ROUTE = `${MESSAGE_ROUTE}/get-initial-contacts`