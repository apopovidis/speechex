import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { useRecorderState } from "./customStateHooks";
import { isNotEmptyArray, sortArray, getSafely } from "../js/genericFunctions";
import { logout } from "../redux/actions/authentication";
import { transcribe, saveAudio } from "../redux/actions/transcription";
import Header from "./Header";

const isValidAudio = a => getSafely(() => a.size > 0, false);

const TranscriptionPage = ({ transcript, audio, spokenSentences, dispatch }) => {
  const setAudioWrapper = a => {
    if (!isValidAudio(a)) {
      return;
    }
    dispatch(saveAudio(a));
  }

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [message, setMessage] = useState("");
  const { recorder } = useRecorderState(setAudioWrapper);

  useEffect(() => {
    // returned function will be called on component unmount  to cleanup login and transcribed data for the next user
    return () => {
      dispatch(logout());
    };
  }, [dispatch]);

  const handleStartRecording = () => {
    if (!recorder) {
      setMessage("oups, something went wrong, recorder is not set");
      return;
    }
    setMessage("");
    recorder.start();
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    if (!recorder) {
      setMessage("oups, something went wrong, recorder is not set");
      return;
    }
    recorder.stop();
    setIsRecording(false);
  };

  const setErrMessageWrapper = err => {
    if (err.error) {
      setMessage(err.error);
    } else {
      setMessage(err);
    }
  }

  const submit = a => {
    try {
      if (!isValidAudio(a)) {
        setMessage("submit failed, recorded audio data seems to be empty")
        return false;
      }

      setMessage("");

      new Promise(resolve => {
        dispatch(saveAudio(null));
        return resolve();
      }).then(() => {
        // mark the start of transcription
        setIsTranscribing(true);
        dispatch(transcribe(a))
          .then(() => setIsTranscribing(false))
          .catch(err => {
            // mark the end of transcription
            setIsTranscribing(false);
            setErrMessageWrapper(err)
          });
      });
    } catch (err) {
      // mark the end of transcription
      setIsTranscribing(false);
      setErrMessageWrapper(err)
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    submit(audio);
  };

  const handlePlaySpokenSentence = audioBlob => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  }

  const spokenSentenceMapper = (s, i) => (
    <div className="row" key={`sentence-${i}`}>
      <div className="col"><p>{s.timestamp.toString()}</p></div>
      <div className="col"><p>{s.transcript}</p></div>
      <div className="col"><p>{getSafely(() => (Number(s.confidence) * 100).toFixed(2), 0)}%</p></div>
      <div className="col"><p><button className="btn btn-success btn-md" onClick={() => handlePlaySpokenSentence(s.audio)} type="button">Play</button></p></div>
    </div>
  );

  const spokenSentencesWrapper = isNotEmptyArray(spokenSentences) ? sortArray(spokenSentences, "timestamp", false).map((s, i) => spokenSentenceMapper(s, i)) : [];

  const biSoundWaveClass = isRecording ? "bi-soundwave-on" : "bi-soundwave-off";
  const biMicClass = isRecording ? "bi-mic bi-mic-on" : "bi-mic-fill bi-mic-off";

  return (
    <div className="container-fluid transcription-container">
      <Header />
      <form>
        <div className="container-fluid">
          <div className="row">
            <div className="col">
              <i className={`bi ${biMicClass}`}
                onMouseDown={handleStartRecording}
                onMouseUp={handleStopRecording}
                onTouchStart={handleStartRecording}
                onTouchEnd={handleStopRecording}
              ></i>
            </div>
            <div className="col">
              <i className={`bi bi-soundwave ${biSoundWaveClass}`}></i>
            </div>
            <div className="col">
              {isTranscribing ? (
                <p><b>Transcribing...</b></p>
              ) : (
                <button type="submit" className="btn btn-light btn-md" onClick={handleSubmit}>
                  Submit
                </button>
              )}
            </div>
            {message && <p style={{ margin: "1em", color: "red" }}>{message}</p>}
          </div>
        </div>
        <div className="container-fluid">
          <div className="row">
            <div className="col result">{(transcript !== undefined && transcript !== null) ? transcript : "Result"}</div>
          </div>
        </div>
        {spokenSentencesWrapper && isNotEmptyArray(spokenSentencesWrapper) && <div style={{ marginTop: "20px" }} className="container">
          <div className="row">
            <div className="col">
              <h5>Transcribed sentences</h5>
            </div>
          </div>
          <div className="row">
            <div className="col"><p><b>Timestamp</b></p></div>
            <div className="col"><p><b>Transcript</b></p></div>
            <div className="col"><p><b>Confidence</b></p></div>
            <div className="col"><p><b>Audio</b></p></div>
          </div>
          {spokenSentencesWrapper}
        </div>
        }
      </form>
    </div>
  );
};

TranscriptionPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  transcript: PropTypes.string,
  audio: PropTypes.object,
  spokenSentences: PropTypes.array,
};

const mapStateToProps = state => ({
  transcript: state.transcription.transcript,
  audio: state.transcription.audio,
  spokenSentences: state.transcription.spokenSentences,
});

export default connect(mapStateToProps)(TranscriptionPage);
