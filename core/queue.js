// core/queue.js

import { sendRequest } from "../services/api.js";
import { getRetryDelay } from "../services/retryPolicy.js";
import { setDeliveryState } from "../ui/render/renderDelivery.js";
import { setRecoveryState } from "../ui/render/renderRecovery.js";

/* ---------- CONSTANTS ---------- */

const STORAGE_KEY = "haven_queue";
const MAX_QUEUE = 50;
const MAX_RETRIES = 3;
let processing = false;

/* ---------- STORAGE ---------- */

function loadQueue() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveQueue(q) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(q));
}

/* ---------- ENQUEUE ---------- */

export async function enqueue(payload) {
  const queue = loadQueue();

  if (queue.length >= MAX_QUEUE) {
    queue.shift();
  }

  queue.push({
    id: crypto.randomUUID(),
    payload,
    retries: 0,
    createdAt: Date.now()
  });

  saveQueue(queue);
  setDeliveryState("queued");

  if (!processing) processQueue();
}

/* ---------- PROCESS ---------- */

export async function processQueue() {
  if (processing) return;

  const queue = loadQueue();
  if (queue.length === 0) {
    processing = false;
    return;
  }

  processing = true;

  while (queue.length > 0) {
    const req = queue[0];
    const job = req.payload;

    try {
      // Gọi API gửi đơn
      const result = await sendRequest(job);

      // Xử lý Thành công: Bao gồm cả status "success" và "duplicate"
      // Vì duplicate nghĩa là dữ liệu đã nằm an toàn trên Google Sheets
      if (result?.success || result?.duplicate) {
        
        // 1. Xóa đơn hàng đầu tiên khỏi hàng đợi
        queue.shift();
        saveQueue(queue);

        // 2. Nếu đã gửi xong xuôi toàn bộ hàng đợi
        if (queue.length === 0) {
          setDeliveryState("sent"); // Hiển thị trạng thái Đã gửi thành công
          
          // Phản hồi rung nhẹ trên thiết bị di động nếu hỗ trợ
          if (navigator.vibrate) navigator.vibrate(50);

          // 3. Đưa UI về trạng thái nghỉ sau khi khách đã thấy thông báo thành công
          setTimeout(() => {
            setDeliveryState("idle");
            setRecoveryState("idle");
          }, 3000); 
        }

        // Tiếp tục vòng lặp để xử lý đơn tiếp theo (nếu có)
        continue;
      }

      // Nếu API trả về lỗi logic (không phải success/duplicate)
      throw new Error(result?.message || "server_logic_error");

    } catch (e) {
      console.error("Queue Processing Error:", e);

      // Xử lý lỗi Mạng/Ngoại tuyến: Dừng hàng đợi và báo Failed
      if (e.message === "offline" || e.message === "network" || !navigator.onLine) {
        setDeliveryState("failed");
        processing = false;
        return; // Thoát hàm để chờ mạng ổn định lại
      }

      // Xử lý lỗi Server/Logic: Thử lại (Retry)
      req.retries = (req.retries || 0) + 1;

      if (req.retries > MAX_RETRIES) {
        // Quá số lần thử lại: Xóa đơn lỗi để không làm nghẽn hàng đợi
        queue.shift();
        saveQueue(queue);
        setDeliveryState("failed");
      } else {
        // Lưu lại số lần đã thử và tạm dừng để thử lại sau
        saveQueue(queue);
        setDeliveryState("queued");
        
        const delay = (typeof getRetryDelay === 'function') ? getRetryDelay(req.retries) : 2000;
        await new Promise(res => setTimeout(res, delay));
      }
      
      // Dừng vòng lặp hiện tại để không gây quá tải khi đang lỗi
      break;
    }
  }

  processing = false;
}
/* ---------- RECOVERY ---------- */

export function detectRecovery() {
  const q = loadQueue();
  if (q.length > 0) {
    setRecoveryState("found");
  }
}

/* ---------- EVENTS ---------- */

window.addEventListener("resumeQueue", () => {
  if (!processing) processQueue();
});

window.addEventListener("online", () => {
  if (loadQueue().length > 0) {
    processQueue();
  }
});