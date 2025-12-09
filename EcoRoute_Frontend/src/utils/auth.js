import {jwtDecode} from "jwt-decode";

export function getTokenPayload() {
  const token = localStorage.getItem("ecoroute_token");
  if (!token) return null;
  try {
    // token may be non-standard (mock). Attempt decode robustly:
    const parts = token.split(".");
    if (parts.length >= 2) {
      const payload = parts[1];
      const json = atob(payload);
      return JSON.parse(json);
    }
    return jwtDecode(token);
  } catch (err) {
    console.warn("Token decode failed", err);
    return null;
  }
}
