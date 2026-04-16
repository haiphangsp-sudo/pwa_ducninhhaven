import { getState, setState } from "./state.js";
import { CONFIG } from "../config.js";

const SCRIPT_URL = CONFIG.API_ENDPOINT;
const STORAGE_KEY = "haven_active_order_ids";

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

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];

  return items.map(item => ({
    id: item?.id  === "string" ? item?.id : "",
    qty: Number(item?.qty || 0),
    price: Number(item?.price || 0),
    subtotal: Number(item?.subtotal || 0),

    // text cho GAS / legacy fallback
    item: item?.item || "",
    option: item?.option || "",

    // snapshot song ngữ / tracker fallback
    itemLabel: item?.itemLabel || null,
    optionLabel: item?.optionLabel || null,

    categoryKey: item?.categoryKey || "",
    productKey: item?.productKey || "",
    variantKey: item?.variantKey || ""
  }));
}
export function normalizeOrder(order = {}) {
  const items = safeArray(order.items);

  const totalQty = items.reduce((sum, i) => sum + (i.qty || 0), 0);
  const totalPrice = items.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 0), 0);

  return {
    id: normalizeId(order.id),

    status: order.status || "SYNCING",
    items,

    totalQty,
    totalPrice,

    mode: order.mode || "",
    placeId: order.placeId || "",
    placeLabel: order.placeLabel || "",

    anchorId: order.anchorId || "",

    createdAt: order.createdAt || Date.now(),
    updatedAt: order.updatedAt || Date.now(),
    syncedAt: order.syncedAt || 0,

    type: order.type || "",
    device: order.device || ""
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
function dedupeOrders(list = []) {
  const map = new Map();

  list.forEach(raw => {
    const order = normalizeOrder(raw);

    if (!order.id) return; // chặn id lỗi

    const existing = map.get(order.id);

    if (!existing || order.updatedAt > existing.updatedAt) {
      map.set(order.id, order);
    }
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
    .map(o => normalizeId(o?.id))
    .filter(Boolean);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function getSavedIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(raw)
      ? raw.filter(id => typeof id === "string" && id.trim() !== "")
      : [];
  } catch {
    return [];
  }
}

/* =========================
   PUBLIC
========================= */
export function addOrderToTracking(meta = {}) {
  const newOrder = normalizeOrder({
    id: meta.id,
    status: "SYNCING",
    items: meta.items || [],
    mode: meta.mode,
    placeId: meta.placeId,
    placeLabel: meta.placeLabel,
    anchorId: meta.anchorId
  });

  if (!newOrder.id) {
    console.warn("Invalid order id, skip tracking", meta);
    return;
  }

  const state = getState();
  const active = state.orders?.active || [];

  const merged = dedupeOrders([newOrder, ...active]);

  persistActiveIds(merged);

  setState({
    orders: {
      ...state.orders,
      active: merged
    }
  });
}

export async function syncOrdersWithServer() {
  const savedIds = getSavedIds();
  if (savedIds.length === 0) return;

  try {
    const response = await fetch(
      `${SCRIPT_URL}?action=getStatuses&ids=${savedIds.join(",")}`
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const updates = await response.json();

    const state = getState();
    const currentActive = state.orders?.active || [];
    const currentInactive = state.orders?.inactive || [];
    const currentMap = new Map(
      [...currentActive, ...currentInactive].map(order => [order.id, order])
    );

    const rebuilt = savedIds.map(id => {
      const existing = currentMap.get(id);
      const incoming = updates[id];

      if (typeof incoming === "string") {
        return normalizeOrder({
          ...existing,
          id,
          status: incoming,
          createdAt: existing?.createdAt,
          updatedAt: Date.now(),
          syncedAt: Date.now()
        });
      }

      if (incoming && typeof incoming === "object") {
        return normalizeOrder({
          ...existing,
          ...incoming,
          id,

          // giữ snapshot local nếu GS không trả
          items: incoming.items ?? existing?.items,
          placeId: incoming.placeId ?? existing?.placeId,
          placeLabel: incoming.placeLabel ?? existing?.placeLabel,
          anchorId: incoming.anchorId ?? existing?.anchorId,
          mode: incoming.mode ?? existing?.mode,

          createdAt: existing?.createdAt ?? incoming.createdAt ?? incoming.timestamp,
          updatedAt: Date.now(),
          syncedAt: Date.now()
        });
      }

      return normalizeOrder({
        ...existing,
        id,
        status: existing?.status || "SYNCING",
        createdAt: existing?.createdAt || Date.now(),
        updatedAt: existing?.updatedAt || Date.now(),
        syncedAt: existing?.syncedAt || 0
      });
    });

    const next = splitOrders([
      ...currentInactive.filter(order => !savedIds.includes(order.id)),
      ...rebuilt
    ]);

    setState({
      orders: {
        ...state.orders,
        active: next.active,
        inactive: next.inactive
      }
    });

    persistActiveIds(next.active);
    clearCompletedOrders(getState());
  } catch (error) {
    console.error("Haven Service Error [Sync]:", error);
  }
}
function normalizeId(value) {
  return typeof value === "string" && value.trim() !== "" ? value : "";
}

function safeArray(arr) {
  return Array.isArray(arr) ? arr : [];
}
function clearCompletedOrders(state) {
  const active = state.orders?.active || [];
  const inactive = state.orders?.inactive || [];

  const stillActive = active.filter(order => !isTerminalStatus(order.status));
  const nextInactive = dedupeOrders([
    ...inactive,
    ...active.filter(order => isTerminalStatus(order.status))
  ])
    .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0))
    .slice(0, MAX_INACTIVE_ORDERS);

  setState({
    orders: {
      ...state.orders,
      active: stillActive,
      inactive: nextInactive
    }
  });

  persistActiveIds(stillActive);
}
export function hydrateOrdersFromStorage() {
  const savedIds = getSavedIds();

  const active = savedIds.map(id =>
    normalizeOrder({
      id,
      status: "SYNCING",
      items: [],
      createdAt: Date.now()
    })
  );

  setState({
    orders: {
      active,
      inactive: []
    }
  });
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