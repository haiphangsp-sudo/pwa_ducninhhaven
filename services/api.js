// services/api.js

import { CONFIG } from "../config.js";
import { isOnline, fetchWithTimeout } from "./network.js";
import { markSuccess } from "./health.js";

export async function sendRequest(payload) {
  if (!isOnline()) {
    throw new Error("offline");
  }

  const body = JSON.stringify({
    ...payload,
    secret: CONFIG.API_SECRET
  });

  let res;

  try {
    res = await fetchWithTimeout(
      CONFIG.API_ENDPOINT,
      {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body
      },
      15000
    );
  } catch {
    throw new Error("network");
  }

  if (!res?.ok) {
    throw new Error("server");
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("invalid_json");
  }

  const status = data?.status;

  if (status === "unauthorized") {
    return { success: false, fatal: true, message: "unauthorized" };
  }

  if (status === "invalid") {
    return { success: false, fatal: true, message: "invalid" };
  }

  if (status === "rate_limited" || status === "retry") {
    throw new Error("retry");
  }

  if (status === "duplicate") {
    markSuccess();
    return { success: true, duplicate: true };
  }

  if (status === "ok" || status === "success" || data?.success === true) {
    markSuccess();
    return { success: true };
  }

  return {
    success: false,
    message: data?.message || status || "unknown_response"
  };
}