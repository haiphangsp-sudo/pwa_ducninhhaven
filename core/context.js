import { CONFIG } from "../config.js";
import { getState, setState } from "./state.js";
import { resolvePlace } from "./placeQuery.js";

/* =======================================================
   CẤU HÌNH & BIẾN NỘI BỘ
======================================================= */

const TTL_ACTIVE = 1000 * 60 * 30;      // 30 phút cho Active
const TTL_ANCHOR = 1000 * 60 * 60 * 48; // 48 giờ cho Anchor

let _ctx = loadFromStorage();

/* =======================================================
   HÀM ĐỌC (GETTERS)
======================================================= */

export function getContext() {
  const state = getState();
  return state.context || {
    anchor: null,
    active: null,
    current: { id: null, type: "table", isGuest: true }
  };
}

/* =======================================================
   HÀM XỬ LÝ URL (KHÔI PHỤC LOGIC CŨ)
======================================================= */

export function applyURLContext() {
  const params = new URLSearchParams(location.search);
  const placeId = params.get("place");
  const modeId = params.get("mode");

  if (!placeId) return;

  const resolved = resolvePlace(placeId);
  if (!resolved) return;

  // Khôi phục logic kiểm tra Mode từ file cũ
  const validModes = ["room", "area", "table"];
  if (modeId && (!validModes.includes(modeId) || resolved.type !== modeId)) {
    console.warn("[Haven] URL Mode không hợp lệ hoặc không khớp với Place");
    return;
  }

  // Dọn dẹp URL
  history.replaceState({}, "", location.pathname);

  const ref = { id: resolved.id, type: resolved.type, at: Date.now() };

  // Logic cũ: Nếu chưa có anchor hoặc quét QR mới, thiết lập cả hai
  _ctx.anchor = ref;
  _ctx.active = ref;

  saveToStorage(_ctx); // Lưu ngay để chống mất khi reload
}

/* =======================================================
   HÀM CHUẨN HÓA & ĐỒNG BỘ
======================================================= */

export function normalizeContext() {
  _ctx = loadFromStorage();
  const now = Date.now();

  // Kiểm tra hết hạn 30p (Active)
  if (_ctx.active?.at && (now - _ctx.active.at > TTL_ACTIVE)) {
    _ctx.active = null;
  }

  // Kiểm tra hết hạn 48h (Anchor)
  if (_ctx.anchor?.at && (now - _ctx.anchor.at > TTL_ANCHOR)) {
    _ctx.anchor = null;
  }
}

export function syncContextToState() {
  const current = _ctx.active || _ctx.anchor;

  setState({
    context: {
      anchor: _ctx.anchor,
      active: _ctx.active,
      current: {
        id: current?.id || null,
        type: current?.type || "table",
        isGuest: !_ctx.anchor
      }
    }
  });

  saveToStorage(_ctx);
}

/* =======================================================
   HÀM APPLY (THAY THẾ applyPlaceById CŨ)
======================================================= */

/**
 * Tương đương với applyPlaceById cũ nhưng có lưu 'at'
 */
export function applyPlaceById(placeId) {
  if (!placeId) return;

  const resolved = resolvePlace(placeId);
  if (!resolved) return;

  // Cập nhật vị trí ngồi hiện tại
  _ctx.active = {
    id: resolved.id,
    type: resolved.type,
    at: Date.now()
  };

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