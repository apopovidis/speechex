import * as types from "../actions/types";

const initialState = {
  accessToken: null
};

export default function(state = initialState, action) {
  switch (action.type) {
    case types.RECEIVE_AUTHENTICATION_DATA: {
      if (!action.payload.accessToken) {
        return state;
      }
      return { ...state, accessToken: action.payload.accessToken };
    }

    case types.RECEIVE_LOGOUT_REQUEST: {
      return { ...state, accessToken: null };
    }

    default: {
      return state;
    }
  }
}
