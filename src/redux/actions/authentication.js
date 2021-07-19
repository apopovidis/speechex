import fetch from 'isomorphic-fetch';
import * as types from "./types";
import * as uris from "./uris";
import { isAuthenticated } from "../../actions/authentication";
import { receiveRequestErrors } from "./errors";

export const receiveAuthenticationData = payload => ({ type: types.RECEIVE_AUTHENTICATION_DATA, payload });

export const receiveLogoutRequest = () => ({ type: types.RECEIVE_LOGOUT_REQUEST });

export const logout = () => async dispatch => {
  try {
    await dispatch(receiveLogoutRequest());
    await localStorage.removeItem("accessToken");
    window.location.href = "/login";
  } catch (err) {
    dispatch(receiveRequestErrors(err));
    console.error(err);
  }
};

export const login = (email, password) => dispatch => {
  try {
    if (isAuthenticated()) {
      const json = {
        error: "Could not login",
        description: "user is already logged in"
      };
      dispatch(receiveRequestErrors(json));
      return Promise.reject(json);
    }
    return processLoginWrapper(dispatch, email, password);
  } catch (err) {
    dispatch(receiveRequestErrors(err));
    return Promise.reject(err);
  }
};

export const processLoginWrapper = async (dispatch, email, password) => {
  try {
    const response = await processLogin(email, password)
    const res = await response.json();
    if (!response.ok) {
      throw { error: "could not get access token", res };
    }

    if (res.accessToken) {
      dispatch(receiveAuthenticationData(res));
      return Promise.resolve(res);
    }

    throw { error: "access token not present in response", res };
  } catch (err) {
    dispatch(receiveRequestErrors(err));
    return Promise.reject(err);
  }
};

const processLogin = (email, password) => fetch(uris.LOGIN_URI, {
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email,
    password
  })
});

