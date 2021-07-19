import { MediaRecorder, register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';

export const getRecorder = async (setAudio) => {
  await register(await connect());

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/wav' });
  mediaRecorder.ondataavailable = e => {
    setAudio(e.data);
  };

  const start = () => mediaRecorder.start();
  const stop = () => mediaRecorder.stop();
  return { start, stop };
};