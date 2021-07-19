import * as types from "../actions/types";

const initialState = {
  audio: null,
  transcript: null,
  spokenSentences: []
};

export default function (state = initialState, action) {
  switch (action.type) {
    case types.SAVE_AUDIO: {
      return { ...state, audio: action.payload };
    }

    case types.RECEIVE_TRANSCRIPTION_DATA: {
      if (!action.payload) {
        return state;
      }
      return { ...state, transcript: action.payload.transcript, spokenSentences: [...state.spokenSentences, action.payload] };
    }

    case types.RECEIVE_LOGOUT_REQUEST: {
      return { ...state, ...initialState };
    }

    default: {
      return state;
    }
  }
}
