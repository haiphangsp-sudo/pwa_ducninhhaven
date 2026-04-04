// core/context.js
import { CONFIG } from "../config.js";
import { getState, setState } from "./state.js";
import { resolvePlace } from "./placeQuery.js";

const TTL_ACTIVE = 1000 * 60 * 30;      // 30 phút
const TTL_ANCHOR = 1000 * 60 * 60 * 48; // 48 giờ

let _ctx = { anchor: null, active: null };

/* --- READERS --- */
export function getContext() {
  return getState().context || { 
    current: { id: null, type: "table", isGuest: true } 
  };
}

/* --- MAIN LOGIC --- */

// 1. Đọc dữ liệu từ máy khách và lọc bỏ cái hết hạn
export function normalizeContext() {
  const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
  _ctx = raw ? JSON.parse(raw) : { anchor: null, active: null };
  
  const now = Date.now();
  if (_ctx.active?.at && (now - _ctx.active.at > TTL_ACTIVE)) _ctx.active = null;
  if (_ctx.anchor?.at && (now - _ctx.anchor.at > TTL_ANCHOR)) _ctx.anchor = null;
}

// 2. Xử lý URL (Phải chạy SAU KHI loadPlaces xong)
export function applyURLContext() {
  const params = new URLSearchParams(location.search);
  const placeId = params.get("place");
  const modeId = params.get("mode");

  if (!placeId) return;

  const resolved = resolvePlace(placeId);
  if (!resolved) {
    console.warn("[Haven] Không tìm thấy vị trí:", placeId);
    return;
  }

  // Kiểm tra mode nếu có (Logic cũ của bạn)
  const validModes = ["room", "area", "table"];
  if (modeId && (!validModes.includes(modeId) || resolved.type !== modeId)) {
    return;
  }

  const ref = { id: resolved.id, type: resolved.type, at: Date.now() };
  
  // Thiết lập mới hoàn toàn khi quét QR
  _ctx.anchor = ref;
  _ctx.active = ref;
  
  // Xóa URL cho sạch
  history.replaceState({}, "", location.pathname);
}

// 3. Đẩy vào State và Lưu vào Storage
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

  localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(_ctx));
}

/* --- UI ACTIONS --- */

export function applyPlaceById(placeId) {
  const resolved = resolvePlace(placeId);
  if (!resolved) return;

  _ctx.active = { id: resolved.id, type: resolved.type, at: Date.now() };
  syncContextToState();
}