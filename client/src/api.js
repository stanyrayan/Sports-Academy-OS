import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://127.0.0.1:5000/api")
});

function readStoredToken() {
  try {
    return window.localStorage.getItem("cricacademy-token");
  } catch {
    return null;
  }
}

function writeStoredToken(token) {
  try {
    if (token) {
      window.localStorage.setItem("cricacademy-token", token);
      return;
    }
    window.localStorage.removeItem("cricacademy-token");
  } catch {
    // Embedded browsers can disable storage. Auth still works for the current session.
  }
}

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    writeStoredToken(token);
    return;
  }

  delete api.defaults.headers.common.Authorization;
  writeStoredToken(null);
}

const savedToken = readStoredToken();
if (savedToken) {
  setAuthToken(savedToken);
}

export default api;
