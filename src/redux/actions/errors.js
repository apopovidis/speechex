import * as types from "./types";

export const receiveRequestErrors = ({ errors }) => ({
    type: types.RECEIVE_REQUEST_ERRORS,
    errors,
    receivedAt: Date.now()
  });
