import { getState, setState } from './state.js';
import { CONFIG } from '../config.js';

const SCRIPT_URL = CONFIG.API_ENDPOINT;
const STORAGE_KEY = "haven_active_order_ids";

const TERMINAL_STATUSES = ['DONE', 'RECOVERING', 'CANCELED'];
const ACTIONABLE_STATUSES = ['NEW', 'COOKING', 'DELIVERING', 'SYNCING'];

function normalizeOrder(order = {}) {
  return {
    id: order.id || "",
    status: order.status || "NEW",
    items: Array.isArray(order.items) ? order.items : [],
    time: order.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    totalQty: Number(order.totalQty || 0),
    totalPrice: Number(order.totalPrice || 0),
    mode: order.mode || "",
    placeLabel: order.placeLabel || "",
    type: order.type || "",
    device: order.device || ""
  };
}

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
      items: order.items?.length ? order.items : prev.items
    });
  });

  return Array.from(map.values());
}

function persistActiveIds(orders = []) {
  const ids = orders
    .filter(order => order.id && !TERMINAL_STATUSES.includes(order.status))
    .map(order => order.id);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function _getSavedIds() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addOrderToTracking(orderId, items = [], meta = {}) {
  if (!orderId) return;

  const state = getState();
  const currentActive = state.orders?.active || [];

  const incoming = normalizeOrder({
    id: orderId,
    status: 'NEW',
    items,
    ...meta
  });

  const merged = dedupeOrders([...currentActive, incoming])
    .filter(order => !TERMINAL_STATUSES.includes(order.status));

  setState({
    orders: {
      active: merged
    }
  });

  persistActiveIds(merged);
}

export async function syncOrdersWithServer() {
  const savedIds = _getSavedIds();
  if (savedIds.length === 0) return;

  try {
    const response = await fetch(`${SCRIPT_URL}?action=getStatuses&ids=${savedIds.join(",")}`);
    if (!response.ok) throw new Error("Network response was not ok");

    const updates = await response.json();
    const currentActive = getState().orders?.active || [];
    const currentMap = new Map(currentActive.map(order => [order.id, order]));

    const rebuilt = savedIds.map(id => {
      const existing = currentMap.get(id);
      const incoming = updates[id];

      if (typeof incoming === "string") {
        return normalizeOrder({
          ...existing,
          id,
          status: incoming
        });
      }

      return normalizeOrder({
        ...existing,
        ...(incoming || {}),
        id
      });
    });

    const nextActive = dedupeOrders(rebuilt)
      .filter(order => !TERMINAL_STATUSES.includes(order.status));

    setState({
      orders: {
        active: nextActive
      }
    });

    persistActiveIds(nextActive);
  } catch (error) {
    console.error("Haven Service Error [Sync]:", error);
  }
}

export function clearCompletedOrders() {
  const active = getState().orders?.active || [];
  const stillActive = active.filter(order => !TERMINAL_STATUSES.includes(order.status));

  setState({
    orders: {
      active: stillActive
    }
  });

  persistActiveIds(stillActive);
}

export function hydrateOrdersFromStorage() {
  const savedIds = _getSavedIds();
  if (savedIds.length === 0) return false;

  const placeholderOrders = savedIds.map(id =>
    normalizeOrder({
      id,
      status: 'SYNCING',
      items: []
    })
  );

  setState({
    orders: {
      active: placeholderOrders,
      isBarExpanded: false
    }
  });

  return true;
}

export function getActionableOrders() {
  const active = getState().orders?.active || [];
  return active.filter(order => ACTIONABLE_STATUSES.includes(order.status));
}
