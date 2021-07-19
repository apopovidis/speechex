import fetch from 'isomorphic-fetch';
import * as types from "./types";
import * as uris from "./uris";
import { isAuthenticated } from "../../actions/authentication";
import { receiveRequestErrors } from "./errors";
import { logout } from "./authentication";

export const receiveTransactionData = payload => ({ type: types.RECEIVE_TRANSCRIPTION_DATA, payload });

export const saveAudio = payload => ({ type: types.SAVE_AUDIO, payload });

export const transcribe = data => dispatch => {
  try {
    if (!isAuthenticated()) {
      dispatch(logout());
      return Promise.reject({ error: "unauthorized" });
    }

    return processTranscriptionWrapper(dispatch, data);
  } catch (err) {
    dispatch(receiveRequestErrors(err));
    return Promise.reject({ error: err.message });
  }
};

export const processTranscriptionWrapper = async (dispatch, data) => {
  try {
    const response = await processTranscription(data)
    const res = await response.json();
    if (!response.ok) {
      console.error(response)
      if (response.status === 401) {
        dispatch(logout());
        const json = {
          message: "Could not transcribe audio",
          errors: [{ message: "unauthorized" }]
        };
        dispatch(receiveRequestErrors(json));
        throw json;
      } else {
        throw { error: "could not transcribe audio", res };
      }
    }
    dispatch(receiveTransactionData({
      timestamp: new Date().toLocaleString(),
      audio: data,
      ...res
    }));
    return Promise.resolve(res);
  } catch (err) {
    dispatch(receiveRequestErrors(err));
    return Promise.reject(err);
  }
};

const processTranscription = data => {
  try {
    const formData = new FormData();
    formData.append("audio", data);
    return fetch(uris.TRANSCRIPTION_URI, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`
      },
      body: formData
    })
  } catch (err) {
    console.error("processTranscription", err)
    return Promise.reject(err);
  }
};
