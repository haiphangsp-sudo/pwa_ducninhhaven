import { getState, setState } from "./state.js";
import { CONFIG } from "../config.js";

const SCRIPT_URL = CONFIG.API_ENDPOINT;
const ACTIVE_STORAGE_KEY = "haven_active_order_ids";
const HISTORY_STORAGE_KEY = "haven_order_history";

const TERMINAL_STATUSES = ["DONE", "CANCELED"];
const ACTIONABLE_STATUSES = ["NEW", "COOKING", "DELIVERING", "DONE", "SYNCING"];
const MAX_INACTIVE_ORDERS = 10;
const SYNCING_STALE_MS = 15000;

/* =========================
   HELPERS
========================= */

function normalizeId(value) {
  return typeof value === "string" && value.trim() !== "" ? value : "";
}

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

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];

  return items.map(item => ({
    id: normalizeId(item?.id),
    qty: Number(item?.qty || 0),
    price: Number(item?.price || 0),
    subtotal: Number(item?.subtotal || 0),

    item: item?.item || "",
    option: item?.option || "",

    itemLabel: item?.itemLabel || null,
    optionLabel: item?.optionLabel || null,

    categoryKey: item?.categoryKey || "",
    productKey: item?.productKey || "",
    variantKey: item?.variantKey || ""
  }));
}

/* =========================
   NORMALIZE
========================= */

function normalizeOrder(order = {}) {
  const createdAt = toTimestamp(
    order.createdAt ?? order.timestamp ?? order.time,
    Date.now()
  );

  return {
    id: normalizeId(order.id),
    status: order.status || "NEW",
    items: normalizeItems(order.items),
    totalQty: Number(order.totalQty || 0),
    totalPrice: Number(order.totalPrice || 0),

    mode: order.mode || "",
    placeId: order.placeId || order.place || "",
    placeLabel: order.placeLabel || "",
    anchorId: order.anchorId || "",

    type: order.type || "",
    device: order.device || "",

    createdAt,
    updatedAt: toTimestamp(order.updatedAt, createdAt),
    syncedAt: toTimestamp(order.syncedAt, 0)
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

      mode: order.mode || prev.mode,
      placeId: order.placeId || prev.placeId,
      placeLabel: order.placeLabel || prev.placeLabel,
      anchorId: order.anchorId || prev.anchorId,

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
    .map(order => normalizeId(order?.id))
    .filter(Boolean)
    .filter((_, index, arr) => arr.indexOf(_) === index);

  localStorage.setItem(ACTIVE_STORAGE_KEY, JSON.stringify(ids));
}

function getSavedIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(ACTIVE_STORAGE_KEY) || "[]");
    return Array.isArray(raw)
      ? raw.filter(id => typeof id === "string" && id.trim() !== "")
      : [];
  } catch {
    return [];
  }
}

function persistInactiveOrders(inactiveOrders = []) {
  localStorage.setItem(
    HISTORY_STORAGE_KEY,
    JSON.stringify(inactiveOrders.slice(0, MAX_INACTIVE_ORDERS))
  );
}

function getSavedInactiveOrders() {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || "[]");
    return Array.isArray(raw) ? raw.map(normalizeOrder).filter(o => o.id) : [];
  } catch {
    return [];
  }
}

function persistOrdersSnapshot(activeOrders = [], inactiveOrders = []) {
  persistActiveIds(activeOrders);
  persistInactiveOrders(inactiveOrders);
}

/* =========================
   PUBLIC
========================= */

export function addOrderToTracking(meta = {}) {
  const state = getState();
  const active = state.orders?.active || [];
  const inactive = state.orders?.inactive || [];
  const all = [...active, ...inactive];

  const incomingId = normalizeId(meta.id);
  if (!incomingId) return;

  const exists = all.some(order => order.id === incomingId);
  if (exists) return;

  const newOrder = normalizeOrder({
    id: incomingId,
    status: meta.status || "SYNCING",
    items: meta.items || [],
    totalQty: meta.totalQty,
    totalPrice: meta.totalPrice,
    mode: meta.mode,
    placeId: meta.placeId,
    placeLabel: meta.placeLabel,
    anchorId: meta.anchorId,
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

  persistOrdersSnapshot(next.active, next.inactive);
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

    const rebuilt = savedIds
      .map(id => {
        const existing = currentMap.get(id);
        const incoming = updates[id];

        if (!existing) return null;

        if (typeof incoming === "string") {
          return normalizeOrder({
            ...existing,
            status: incoming,
            updatedAt: Date.now(),
            syncedAt: Date.now()
          });
        }

        if (incoming && typeof incoming === "object") {
          return normalizeOrder({
            ...existing,
            status: incoming.status || existing.status || "SYNCING",
            updatedAt: Date.now(),
            syncedAt: Date.now()
          });
        }

        return normalizeOrder({
          ...existing,
          status: existing.status || "SYNCING",
          updatedAt: existing.updatedAt || Date.now(),
          syncedAt: existing.syncedAt || 0
        });
      })
      .filter(Boolean);

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
    persistInactiveOrders(next.inactive);
    clearCompletedOrders(getState());
  } catch (error) {
    console.error("Haven Service Error [Sync]:", error);
  }
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

  persistOrdersSnapshot(stillActive, nextInactive);
}

export function hydrateOrdersFromStorage() {
  const savedIds = getSavedIds();
  const savedInactive = getSavedInactiveOrders();

  if (savedIds.length === 0 && savedInactive.length === 0) return false;

  const state = getState();
  const now = Date.now();

  const placeholders = savedIds.map(id =>
    normalizeOrder({
      id,
      status: "SYNCING",
      items: [],
      createdAt: now,
      updatedAt: now,
      syncedAt: 0
    })
  );

  const next = splitOrders([...placeholders, ...savedInactive]);

  setState({
    orders: {
      ...state.orders,
      active: next.active,
      inactive: next.inactive,
      isBarExpanded: false
    }
  });

  persistOrdersSnapshot(next.active, next.inactive);
  return true;
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

  persistOrdersSnapshot(nextActive, inactive);
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