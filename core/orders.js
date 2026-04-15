// core/orders.js

import { getState, setState } from "./state.js";
import { CONFIG } from "../config.js";

const SCRIPT_URL = CONFIG.API_ENDPOINT;
const STORAGE_KEY_ACTIVE = "haven_active_order_ids";
const STORAGE_KEY_HISTORY = "haven_order_history";
const MAX_INACTIVE_AGE_MS = 2 * 24 * 60 * 60 * 1000; // 2 ngày
const TERMINAL_STATUSES = ["DONE", "CANCELED"];
const ACTIONABLE_STATUSES = ["NEW", "COOKING", "DELIVERING", "DONE", "SYNCING"];
const MAX_INACTIVE_ORDERS = 10;
const SYNCING_STALE_MS = 15000;

/* =========================
   TIME
========================= */

function toTimestamp(value, fallback = Date.now()) {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;

    const asNumber = Number(value);
    if (Number.isFinite(asNumber) && asNumber > 0) return asNumber;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.getTime();
  }

  return fallback;
}

/* =========================
   NORMALIZE
========================= */

function normalizeOrder(order = {}) {
  const createdAt = toTimestamp(
    order.createdAt ?? order.timestamp ?? order.time,
    Date.now()
  );

  // GIẢI MÃ ITEMS: Chuyển từ Chuỗi JSON sang Mảng Object
  let parsedItems = [];
  try {
    if (typeof order.items === "string" && order.items.trim() !== "") {
      parsedItems = JSON.parse(order.items);
    } else if (Array.isArray(order.items)) {
      parsedItems = order.items;
    }
  } catch (e) {
    console.error("Lỗi giải mã món ăn:", order.id, e);
    parsedItems = [];
  }

  return {
    id: order.id || "",
    status: order.status || "NEW",
    items: parsedItems, // Bây giờ items đã có dữ liệu thật
    totalPrice: Number(order.totalPrice || 0),
    totalQty: Number(order.totalQty || 0),
    place: order.place || order.placeId || "",
    createdAt,
    updatedAt: toTimestamp(order.updatedAt, createdAt),
    syncedAt: Date.now()
  };
}

function isTerminalStatus(status) {
  return TERMINAL_STATUSES.includes(status);
}

function isActionableStatus(status) {
  return ACTIONABLE_STATUSES.includes(status);
}

function isSyncingTooLong(order = {}) {
  return (
    order.status === "SYNCING" &&
    Date.now() - Number(order.updatedAt || 0) > SYNCING_STALE_MS
  );
}

/* =========================
   DEDUPE / SPLIT
========================= */

function dedupeOrders(orders = []) {
  const map = new Map();

  orders.forEach(raw => {
    const order = normalizeOrder(raw);
    if (!order.id) return;

    const prev = map.get(order.id);
    if (!prev) {
      map.set(order.id, order);
      return;
    }

    map.set(order.id, {
      ...prev,
      ...order,
      items: order.items.length ? order.items : prev.items,
      createdAt: Math.min(
        Number(prev.createdAt || Infinity),
        Number(order.createdAt || Infinity)
      ),
      updatedAt: Math.max(
        Number(prev.updatedAt || 0),
        Number(order.updatedAt || 0)
      ),
      syncedAt: Math.max(
        Number(prev.syncedAt || 0),
        Number(order.syncedAt || 0)
      )
    });
  });

  return Array.from(map.values());
}

function splitOrders(orders = []) {
  const active = [];
  const inactive = [];

  dedupeOrders(orders).forEach(order => {
    if (!order.id) return;
    if (isTerminalStatus(order.status)) inactive.push(order);
    else active.push(order);
  });

  active.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  inactive.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));

  return {
    active,
    inactive: inactive.slice(0, MAX_INACTIVE_ORDERS)
  };
}

/* =========================
   STORAGE
========================= */

function persistActiveIds(activeOrders = []) {
  const ids = activeOrders
    .filter(order => order.id && !isTerminalStatus(order.status))
    .map(order => order.id);

  localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(ids));
}

function getSavedIds() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_ACTIVE) || "[]");
  } catch {
    return [];
  }
}

/* =========================
   PUBLIC /orderId, items = [], meta = {}
========================= */

export function addOrderToTracking(meta = {}) {
  const state = getState();
  const active = state.orders?.active || [];
  const inactive = state.orders?.inactive || [];
  const all = [...active, ...inactive];

  const exists = all.some(order => order.id === meta.id);
  if (exists) return;

  const newOrder = normalizeOrder({
    id: meta.id,
    status: meta.status || "NEW",
    items: meta.items || [],
    totalQty: meta.totalQty,
    totalPrice: meta.totalPrice,
    mode: meta.mode,
    place: meta.place,
    placeId: meta.placeId || meta.place,
    placeLabel: meta.placeLabel,
    type: meta.type,
    device: meta.device,
    createdAt: meta.timestamp,
    updatedAt: Date.now(),
    syncedAt: Date.now()
  });

  const next = splitOrders([...active, ...inactive, newOrder]);

  setState({
    orders: {
      ...state.orders,
      active: next.active,
      inactive: next.inactive
    }
  });

  persistActiveIds(next.active);
}
// core/orders.js

export async function syncOrdersWithServer() {
  const savedIds = getSavedIds();
  if (!savedIds || savedIds.length === 0) return;

  try {
    const url = `${SCRIPT_URL}?action=getStatuses&ids=${savedIds.join(",")}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data?.success && data.orders) {
      const state = getState();
      const currentActive = state.orders?.active || [];
      const serverOrdersObj = data.orders; // Đây là Object { "ID": {status:...} }

      const updatedActive = currentActive.map(localOrder => {
        // Lấy thông tin cập nhật từ server dựa trên ID
        const serverUpdate = serverOrdersObj[localOrder.id];

        if (serverUpdate) {
          // QUAN TRỌNG: 
          // Trả về toàn bộ localOrder (để giữ lại items có đa ngôn ngữ)
          // Chỉ cập nhật status và thời gian từ serverUpdate
          return {
            ...localOrder,
            status: serverUpdate.status || localOrder.status,
            updatedAt: Date.now()
          };
        }
        
        // Nếu server không trả về (có thể đơn chưa lên kịp Sheets), giữ nguyên local
        return localOrder;
      });

      setState({
        orders: { ...state.orders, active: updatedActive }
      });
    }
  } catch (error) {
    console.error("Haven Sync Error:", error);
  }
}
export function clearCompletedOrders() {
  const state = getState();
  const inactive = state.orders?.inactive || [];
  if (inactive.length === 0) return;

  const now = Date.now();

  // 1. Lọc theo thời gian: Chỉ giữ lại đơn trong vòng 48 giờ
  let filtered = inactive.filter(order => {
    const time = toTimestamp(order.updatedAt, order.createdAt);
    return (now - time) < MAX_INACTIVE_AGE_MS;
  });

  // 2. Lọc theo số lượng: Sắp xếp mới nhất lên đầu và lấy tối đa 10 đơn
  filtered.sort((a, b) => toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt));
  if (filtered.length > MAX_INACTIVE_ORDERS) {
    filtered = filtered.slice(0, MAX_INACTIVE_ORDERS);
  }

  // 3. Cập nhật State và ghi đè xuống LocalStorage
  setState({
    orders: {
      ...state.orders,
      inactive: filtered
    }
  });

  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(filtered));
}
export function hydrateOrdersFromStorage() {
  const savedActiveIds = JSON.parse(localStorage.getItem(STORAGE_KEY_ACTIVE) || "[]");
  const savedHistory = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || "[]");

  const now = Date.now();
  
  // Phục hồi placeholder cho đơn đang active để sync lại với server
  const placeholders = savedActiveIds.map(id => normalizeOrder({
    id,
    status: "SYNCING",
    items: [],
    createdAt: now,
    updatedAt: now
  }));

  setState({
    orders: {
      ...getState().orders,
      active: placeholders,
      inactive: savedHistory
    }
  });

  // Dọn dẹp ngay lúc khởi động để xóa các đơn quá 2 ngày/10 đơn
  clearCompletedOrders();
  
  return placeholders.length > 0;
}
export function markSyncingAgedOrders() {
  const state = getState();
  const active = state.orders?.active || [];
  const inactive = state.orders?.inactive || [];

  let changed = false;

  const nextActive = active.map(order => {
    if (!isSyncingTooLong(order)) return order;
    changed = true;
    return normalizeOrder({
      ...order,
      updatedAt: Date.now()
    });
  });

  if (!changed) return false;

  setState({
    orders: {
      ...state.orders,
      active: nextActive,
      inactive
    }
  });

  return true;
}

export function getActionableOrders() {
  const active = getState().orders?.active || [];
  return active.filter(order => isActionableStatus(order.status));
}

export function getRecentInactiveOrders() {
  return (getState().orders?.inactive || []).slice(0, MAX_INACTIVE_ORDERS);
}

export function getSyncingOrders() {
  const active = getState().orders?.active || [];
  return active.filter(order => order.status === "SYNCING");
}
