
import { getSafely } from "../../js/genericFunctions";

const ENDPOINT_IP = !getSafely(() => process.env.ENDPOINT_IP) ? "http://localhost" : process.env.ENDPOINT_IP;
const ENDPOINT_PORT = !getSafely(() => process.env.ENDPOINT_PORT) ? "8000" : process.env.ENDPOINT_PORT;

export const API_HOST = `${ENDPOINT_IP}:${ENDPOINT_PORT}`;
export const BASE_URI = `${API_HOST}/api`;

export const LOGIN_URI = `${BASE_URI}/auth`;
export const TRANSCRIPTION_URI = `${BASE_URI}/transcribe`;