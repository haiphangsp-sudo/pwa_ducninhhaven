



// services/api.js
// Gửi request dạng application/x-www-form-urlencoded (không gây CORS preflight)

import { CONFIG } from "../config.js";
import { isOnline, fetchWithTimeout } from "./network.js";
import { markSuccess } from "./health.js";

export async function sendRequest(payload) {

  if (!isOnline()) {
    throw new Error("offline");
  }

  // Tạo body dạng form-urlencoded
  const params = new URLSearchParams();

  const fullPayload = {
    ...payload,
    secret: CONFIG.API_SECRET
  };

  Object.keys(fullPayload).forEach(key => {
    const value = fullPayload[key];

    if (Array.isArray(value)) {
      params.append(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null) {
      params.append(key, value);
    }
  });

  let res;

  try {

    res = await fetchWithTimeout(
      CONFIG.API_ENDPOINT,
      {
        method: "POST",
        body: params
      },
      6000
    );

  } catch (e) {
    throw new Error("network");
  }

  if (!res || !res.ok) {
    throw new Error("server");
  }

  let data;

  try {
    data = await res.json();
  } catch {
    throw new Error("invalid_json");
  }

  if(data.status==="unauthorized") return {fatal:true};
  if(data.status==="invalid") return {fatal:true};
  if(data.status==="duplicate") return data;
  if(data.status==="rate_limited") throw new Error("retry");

  if(data.status!=="ok"){
    throw new Error("retry");
  }

  markSuccess();
  return data;
}