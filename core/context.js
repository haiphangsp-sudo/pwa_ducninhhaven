import { CONFIG } from "../config.js";
import { getState, setState } from "./state.js";
import { resolvePlace } from "./placeQuery.js";

/* =======================================================
   CẤU HÌNH & BIẾN NỘI BỘ
======================================================= */

const TTL_ACTIVE = 1000 * 60 * 30;      // 30 phút
const TTL_ANCHOR = 1000 * 60 * 60 * 48; // 48 giờ

let _ctx = loadFromStorage();

/* =======================================================
   READERS (CÁC HÀM ĐỌC)
======================================================= */

/**
 * Hàm lấy ngữ cảnh hiện tại từ State.
 * Đây là hàm bạn cần để thay thế cho đống ngổn ngang cũ.
 */
export function getContext() {
  const state = getState();
  return state.context || {
    anchor: null,
    active: null,
    current: { id: null, type: "table", isGuest: true }
  };
}

/**
 * Kiểm tra tính hợp lệ của thời gian (Internal)
 */
function getValidContext() {
  const now = Date.now();
  const next = { ..._ctx };

  if (next.active?.at && (now - next.active.at > TTL_ACTIVE)) next.active = null;
  if (next.anchor?.at && (now - next.anchor.at > TTL_ANCHOR)) next.anchor = null;

  return next;
}

/* =======================================================
   WRITERS & SYNC (CÁC HÀM GHI)
======================================================= */

export function syncContextToState() {
  const valid = getValidContext();
  const current = valid.active || valid.anchor;

  setState({
    context: {
      anchor: valid.anchor,
      active: valid.active,
      current: {
        id: current?.id || null,
        type: current?.type || "table", 
        isGuest: !valid.anchor 
      }
    }
  });

  _ctx = valid;
  saveToStorage(_ctx);
}

/**
 * Xử lý khi quét QR hoặc vào từ URL
 */
export function applyURLContext() {
  const params = new URLSearchParams(location.search);
  const placeId = params.get("place");
  
  if (!placeId) return syncContextToState();

  const resolved = resolvePlace(placeId);
  if (!resolved) return syncContextToState();

  history.replaceState({}, "", location.pathname);

  const ref = { id: resolved.id, type: resolved.type, at: Date.now() };

  _ctx.anchor = ref;
  _ctx.active = ref;

  syncContextToState();
}

/**
 * Khách tự chọn vị trí mới
 */
export function selectActivePlace(placeId) {
  const resolved = resolvePlace(placeId);
  if (!resolved) return;

  _ctx.active = { id: resolved.id, type: resolved.type, at: Date.now() };
  syncContextToState();
}

/* =======================================================
   STORAGE HELPERS
======================================================= */

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
    return raw ? JSON.parse(raw) : { anchor: null, active: null };
  } catch {
    return { anchor: null, active: null };
  }
}

function saveToStorage(data) {
  localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
}