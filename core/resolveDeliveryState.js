export function resolveDeliveryState({
  hasPlace,
  hasCart,
  online,
  queueStatus,
  recovering
}) {
  if (recovering) return "recovering";
  if (!hasPlace) return "waiting_place";
  if (!hasCart) return "empty_cart";

  if (!online && queueStatus === "queued") return "queued";
  if (!online) return "offline";

  if (queueStatus === "sending") return "sending";
  if (queueStatus === "sent") return "sent";
  if (queueStatus === "failed") return "failed";
  if (queueStatus === "queued") return "queued";

  return "idle";
}