
import { getState } from "./state.js";

export function getActivePlace() {
  const ctx = getState().context || {};

  const now = Date.now();
  const active = ctx.active;
  const anchor = ctx.anchor;

  // active hết hạn (30 phút)
  if (active && now - ctx.updatedAt > 30 * 60 * 1000) {
    return anchor || null;
  }

  return active || anchor || null;
}

export function getActivePlaceId() {
  return getActivePlace()?.id || "";
}

export function getActivePlaceType() {
  return getActivePlace()?.type || "table";
}