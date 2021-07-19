import { combineReducers } from "redux";
import authentication from "./authentication";
import transcription from "./transcription";

const rootReducer = combineReducers({
  authentication,
  transcription
});

export default rootReducer;
