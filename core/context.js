import { CONFIG } from "./config.js";
import { getState, setState } from "./state.js";
import { resolvePlace } from "./placeQuery.js";

/* =======================================================
   CẤU HÌNH HẠN SỬ DỤNG (TTL)
======================================================= */

const TTL_ACTIVE = 1000 * 60 * 30;      // 30 phút (Vị trí ngồi cụ thể)
const TTL_ANCHOR = 1000 * 60 * 60 * 48; // 48 giờ (Mã QR gốc - Phòng/Khu vực)

// Biến nội bộ duy trì trạng thái trước khi đẩy vào State
let _ctx = loadFromStorage();

/* =======================================================
   LOGIC KIỂM TRA & ĐỒNG BỘ
======================================================= */

/**
 * Kiểm tra tính hợp lệ của thời gian (Expired Check)
 */
function getValidContext() {
  const now = Date.now();
  const next = { ..._ctx };

  // Nếu quá 30p, xóa vị trí ngồi active
  if (next.active?.at && (now - next.active.at > TTL_ACTIVE)) {
    next.active = null;
  }

  // Nếu quá 48h, xóa điểm neo anchor
  if (next.anchor?.at && (now - next.anchor.at > TTL_ANCHOR)) {
    next.anchor = null;
  }

  return next;
}

/**
 * Đẩy dữ liệu vào Global State và Lưu trữ Local
 */
export function syncContextToState() {
  const valid = getValidContext();
  
  // Xác định "Vị trí hiện tại" để lọc Menu (Ưu tiên Active > Anchor > table)
  const current = valid.active || valid.anchor;

  setState({
    context: {
      anchor: valid.anchor,
      active: valid.active,
      // 'current' là bộ lọc chính cho menuQuery
      current: {
        id: current?.id || null,
        type: current?.type || "table", 
        isGuest: !valid.anchor // Không có anchor (QR phòng) là khách vãng lai
      }
    }
  });

  // Cập nhật lại biến nội bộ và lưu vào localStorage theo KEY chuẩn trong config
  _ctx = valid;
  saveToStorage(_ctx);
}

/* =======================================================
   XỬ LÝ ĐIỂM VÀO (URL / QR)
======================================================= */

/**
 * Đọc mã ?place= từ URL khi khách quét mã QR
 */
export function applyURLContext() {
  const params = new URLSearchParams(location.search);
  const placeId = params.get("place");
  
  if (!placeId) {
    return syncContextToState(); // Không có query thì chỉ đồng bộ từ storage
  }

  const resolved = resolvePlace(placeId);
  if (!resolved) return syncContextToState();

  // Dọn dẹp URL cho chuyên nghiệp
  history.replaceState({}, "", location.pathname);

  const ref = {
    id: resolved.id,
    type: resolved.type,
    at: Date.now()
  };

  // Quét QR mới thì đặt lại cả Anchor và Active
  _ctx.anchor = ref;
  _ctx.active = ref;

  syncContextToState();
}

/**
 * Cập nhật vị trí khi khách tự chọn bàn khác (Manual Select)
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

/* =======================================================
   HÀM TIỆN ÍCH LƯU TRỮ
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