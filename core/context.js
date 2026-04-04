import { CONFIG } from "../config.js";
import { getState, setState } from "./state.js";
import { resolvePlace } from "./placeQuery.js";

/* =======================================================
   CẤU HÌNH HẠN SỬ DỤNG (TTL)
======================================================= */

const TTL_ACTIVE = 1000 * 60 * 30;      // 30 phút (Vị trí ngồi)
const TTL_ANCHOR = 1000 * 60 * 60 * 48; // 48 giờ (Mã QR gốc/Phòng)

// Biến cục bộ để xử lý trung gian
let _ctx = { anchor: null, active: null };

/* =======================================================
   HÀM ĐỌC (READERS)
======================================================= */

export function getContext() {
  return getState().context || {
    anchor: null,
    active: null,
    current: { id: null, type: "table", isGuest: true }
  };
}

/* =======================================================
   HÀM CŨ ĐƯỢC VIẾT LẠI (MAIN FLOW)
======================================================= */

/**
 * 1. NORMALIZE: Đọc và kiểm tra hạn sử dụng
 * Chạy ngay khi App khởi động để dọn dẹp dữ liệu cũ.
 */
export function normalizeContext() {
  _ctx = loadFromStorage();
  const now = Date.now();

  // Kiểm tra 30p cho vị trí ngồi
  if (_ctx.active?.at && (now - _ctx.active.at > TTL_ACTIVE)) {
    console.log("[Haven] Chỗ ngồi hết hạn 30p -> Reset");
    _ctx.active = null;
  }

  // Kiểm tra 48h cho điểm neo QR
  if (_ctx.anchor?.at && (now - _ctx.anchor.at > TTL_ANCHOR)) {
    console.log("[Haven] Điểm neo QR hết hạn 48h -> Reset");
    _ctx.anchor = null;
  }
}

/**
 * 2. APPLY URL: Xử lý khi quét mã QR mới
 * Nếu có ?place= trên URL, nó sẽ đè lên context hiện tại.
 */
export function applyURLContext() {
  const params = new URLSearchParams(location.search);
  const placeId = params.get("place");
  
  if (!placeId) return; // Không có QR mới thì giữ nguyên _ctx từ bước normalize

  const resolved = resolvePlace(placeId);
  if (!resolved) return;

  // Xóa query URL cho sạch màn hình khách
  history.replaceState({}, "", location.pathname);

  const ref = {
    id: resolved.id,
    type: resolved.type,
    at: Date.now()
  };

  // Quét QR mới thì thiết lập lại toàn bộ
  _ctx.anchor = ref;
  _ctx.active = ref;
}

/**
 * 3. SYNC: Đẩy dữ liệu cuối cùng vào State
 * Phải gọi hàm này cuối cùng để cập nhật UI.
 */
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
   HÀM BỔ TRỢ (HELPERS)
======================================================= */

/**
 * Thay thế cho applyPlaceById cũ
 */
export function selectActivePlace(placeId) {
  const resolved = resolvePlace(placeId);
  if (!resolved) return;

  _ctx.active = {
    id: resolved.id,
    type: resolved.type,
    at: Date.now()
  };

  syncContextToState();
}

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