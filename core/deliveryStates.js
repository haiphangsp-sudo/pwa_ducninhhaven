export const DELIVERY_STATES = {
  idle: {
    canSend: true,
    banner: null,
    buttonKey: "send"
  },

  waiting_place: {
    canSend: false,
    banner: "select_place_first",
    buttonKey: "send"
  },

  empty_cart: {
    canSend: false,
    banner: null,
    buttonKey: "send"
  },

  offline: {
    canSend: false,
    banner: "offline",
    buttonKey: "offline"
  },

  queued: {
    canSend: true,
    banner: "queued",
    buttonKey: "queued"
  },

  sending: {
    canSend: false,
    banner: "sending",
    buttonKey: "sending"
  },

  sent: {
    canSend: true,
    banner: "sent",
    buttonKey: "sent"
  },

  failed: {
    canSend: true,
    banner: "failed",
    buttonKey: "retry"
  },

  recovering: {
    canSend: false,
    banner: "recovering",
    buttonKey: "recovering"
  }
};