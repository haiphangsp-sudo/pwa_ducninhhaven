// services/api.js

import { CONFIG } from "../config.js";
import { isOnline, fetchWithTimeout } from "./network.js";
import { markSuccess } from "./health.js";

/*
**
** Giao tiếp (API Layer): Chịu trách nhiệm gửi dữ liệu đi và nhận phản hồi từ Google Sheets.
**
*/

export async function sendRequest(payload) {
  if (!isOnline()) {
    throw new Error("offline");
  }

  const fullPayload = {
    ...payload,
    secret: CONFIG.API_SECRET
  };

  let res;

  try {
    res = await fetchWithTimeout(
      CONFIG.API_ENDPOINT,
      {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(fullPayload)
      },
      8000
    );
  } catch {
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

  if (data.status === "unauthorized") {
    return { success: false, fatal: true, message: "unauthorized" };
  }

  if (data.status === "invalid") {
    return { success: false, fatal: true, message: "invalid" };
  }

  if (data.status === "rate_limited") {
    throw new Error("retry");
  }

  if (data.status === "retry") {
    throw new Error("retry");
  }

  if (data.status === "duplicate") {
    markSuccess();
    return { success: true, duplicate: true };
  }

  if (data.status === "ok" || data.status === "success") {
    markSuccess();
    return { success: true };
  }

  return { success: false, message: data?.message || "unknown_response" };
}