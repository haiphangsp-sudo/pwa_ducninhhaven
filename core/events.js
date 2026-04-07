// core/events.js
import { setState } from "./state.js";

export function queueOrderCommand(action, line = null, status = "queued") {
  setState({
    order: {
      action,
      line,
      status,
      at: Date.now()
    }
  });
}