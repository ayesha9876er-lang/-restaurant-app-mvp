// The ONLY place where the server address lives.
// Use your laptop's Wi-Fi IPv4 address (run "ipconfig" to find it) and the server port.
// If your Wi-Fi changes, this is the one line you update.
export const BASE_URL = 'http://192.168.0.105:5000/api';

let authToken = null;
let onUnauthorized = null;

// AuthContext calls this after login / logout so every request carries the token.
export const setAuthToken = (token) => {
  authToken = token;
};

// AuthContext registers a function here that logs the user out when the server
// says the token is no longer valid (for example, it expired).
export const setOnUnauthorized = (handler) => {
  onUnauthorized = handler;
};

// Sends a request to the server and returns the JSON answer.
// If anything goes wrong it throws an Error whose message is safe to show to the user.
export async function request(path, { method = 'GET', body, timeout = 10000 } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  // Give up if the server does not answer in 10 seconds.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  let response;
  try {
    response = await fetch(BASE_URL + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    throw new Error(
      error.name === 'AbortError'
        ? 'The server took too long to answer. Please try again.'
        : 'Cannot reach the server. Check that it is running and that your phone is on the same Wi-Fi.'
    );
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    data = null; // the answer had no JSON body
  }

  if (!response.ok) {
    if (response.status === 401 && authToken && onUnauthorized) {
      onUnauthorized(); // expired or invalid token: log the user out
    }
    let message = (data && (data.message || data.error)) || `Request failed (${response.status})`;
    if (data && Array.isArray(data.errors) && data.errors.length > 0) {
      message = `${message}: ${data.errors.join(', ')}`;
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}
