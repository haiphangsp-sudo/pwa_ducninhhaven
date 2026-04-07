import { getState, setState } from './state.js';
import { CONFIG } from '../config.js';

const SCRIPT_URL = CONFIG.API_ENDPOINT;
const STORAGE_KEY = "haven_active_order_ids";

const TERMINAL_STATUSES = ['DONE', 'RECOVERING', 'CANCELED'];
const ACTIONABLE_STATUSES = ['NEW', 'COOKING', 'DELIVERING', 'SYNCING'];
const MAX_INACTIVE_ORDERS = 10;

/* =========================
   NORMALIZE
========================= */

function normalizeOrder(order = {}) {
  return {
    id: order.id || "",
    status: order.status || "NEW",
    items: Array.isArray(order.items) ? order.items : [],
    time:
      order.time ||
      new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
    totalQty: Number(order.totalQty || 0),
    totalPrice: Number(order.totalPrice || 0),
    mode: order.mode || "",
    placeLabel: order.placeLabel || "",
    type: order.type || "",
    device: order.device || "",
    updatedAt: Number(order.updatedAt || Date.now())
  };
}

function isTerminalStatus(status) {
  return TERMINAL_STATUSES.includes(status);
}

function isActionableStatus(status) {
  return ACTIONABLE_STATUSES.includes(status);
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
      updatedAt: Math.max(Number(prev.updatedAt || 0), Number(order.updatedAt || 0))
    });
  });

  return Array.from(map.values());
}

function splitOrders(orders = []) {
  const active = [];
  const inactive = [];

  dedupeOrders(orders).forEach(order => {
    if (!order.id) return;

    if (isTerminalStatus(order.status)) {
      inactive.push(order);
    } else {
      active.push(order);
    }
  });

  inactive.sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));

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

  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function getSavedIds() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

/* =========================
   PUBLIC
========================= */

export function addOrderToTracking(orderId, items = [], meta = {}) {
  if (!orderId) return;

  const state = getState();
  const active = state.orders?.active || [];
  const inactive = state.orders?.inactive || [];
  const all = [...active, ...inactive];

  const exists = all.find(order => order.id === orderId);
  if (exists) return;

  const newOrder = normalizeOrder({
    id: orderId,
    status: "NEW",
    items,
    totalQty: meta.totalQty,
    totalPrice: meta.totalPrice,
    mode: meta.mode,
    placeLabel: meta.placeLabel,
    type: meta.type,
    device: meta.device,
    updatedAt: Date.now()
  });

  const next = splitOrders([...active, ...inactive, newOrder]);

  setState({
    orders: {
      active: next.active,
      inactive: next.inactive
    }
  });

  persistActiveIds(next.active);
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
          updatedAt: Date.now()
        });
      }

      return normalizeOrder({
        ...existing,
        ...(incoming || {}),
        id,
        updatedAt: Date.now()
      });
    });

    const next = splitOrders([
      ...currentInactive.filter(order => !savedIds.includes(order.id)),
      ...rebuilt
    ]);

    setState({
      orders: {
        active: next.active,
        inactive: next.inactive
      }
    });

    persistActiveIds(next.active);
  } catch (error) {
    console.error("Haven Service Error [Sync]:", error);
  }
}

export function clearCompletedOrders() {
  const state = getState();
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
      active: stillActive,
      inactive: nextInactive
    }
  });

  persistActiveIds(stillActive);
}

export function hydrateOrdersFromStorage() {
  const savedIds = getSavedIds();
  if (savedIds.length === 0) return false;

  const state = getState();
  const inactive = state.orders?.inactive || [];

  const placeholders = savedIds.map(id =>
    normalizeOrder({
      id,
      status: "SYNCING",
      items: [],
      updatedAt: Date.now()
    })
  );

  const next = splitOrders([...placeholders, ...inactive]);

  setState({
    orders: {
      active: next.active,
      inactive: next.inactive,
      isBarExpanded: false
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