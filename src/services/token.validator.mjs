// rakuten.token.service.js
import { generateRakutenToken } from "./rakuten.token.mjs";

export async function getValidRakutenToken() {
  if (isTokenValid()) {
    return getToken();
  }

  return await generateRakutenToken();
}


let cachedToken = null;
let tokenExpiry = null;

export function saveToken(tokenData) {
  cachedToken = tokenData.access_token;
  tokenExpiry = Date.now() + tokenData.expires_in * 1000;
}

export function isTokenValid() {
  return cachedToken && Date.now() < tokenExpiry;
}

export function getToken() {
  return cachedToken;
}
