import { useState } from "react";
import { getRecorder } from "./audioHandlers";

export const useRecorderState = (setAudio) => {
  try {
    const [recorder, setRecorder] = useState(null);
 
    const setRecorderWrapper = async () => {
      const recorder = await getRecorder(setAudio);
      setRecorder(recorder);
    };
    
    if (!recorder) {
      setRecorderWrapper();
    }

    return { recorder };
  } catch (err) {
    console.error(err);
  }
};
