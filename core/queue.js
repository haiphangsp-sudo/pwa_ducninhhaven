// core/queue.js

import { sendRequest } from "../services/api.js";
import { setState, UI } from "./state.js"; // Sử dụng UI trực tiếp từ state
import { getRetryDelay } from "../services/retryPolicy.js";
import { clearCart } from "./events.js";
import { setDeliveryState } from "../ui/render/renderDelivery.js";
import { setRecoveryState } from "../ui/render/renderRecovery.js";

const STORAGE_KEY = "haven_queue";
const MAX_QUEUE = 50;
let processing = false;

/* ---------- STORAGE ---------- */

function loadQueue() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveQueue(q) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(q));
}

/* ---------- ENQUEUE ---------- */

export function enqueue(payload) {
  const queue = loadQueue();
  
  if (queue.length >= MAX_QUEUE) {
    queue.shift();
  }

  const newId = crypto.randomUUID();
  queue.push({
    id: newId,
    payload,
    retries: 0,
    createdAt: Date.now()
  });

  saveQueue(queue);

  // Khi có đơn mới vào hàng đợi, báo trạng thái "đang chờ"
  setDeliveryState("pending");

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
      // Nguyên tắc 1: Báo trạng thái "Đang gửi"
      setDeliveryState("sending");

      const body = {
        id: req.id,
        device: navigator.userAgent,
        time: Date.now(),
        ...job // Giữ nguyên các trường: mode, items, category...
      };

      await sendRequest(body);

      // Nguyên tắc 2: Gửi thành công
      if (job.type === "cart") {
        clearCart(); // Xóa giỏ hàng ngay khi đơn đầu tiên trong queue thành công
      }

      queue.shift();
      saveQueue(queue);

      // Nếu đã gửi hết sạch hàng đợi
      if (queue.length === 0) {
        // Nguyên tắc 3: Báo thành công (Hiện tích xanh)
        setDeliveryState("sent");
        
        // Phản hồi xúc giác (Rung nhẹ nếu mobile hỗ trợ)
        if (navigator.vibrate) navigator.vibrate(50);

        // Tự động dọn dẹp Banner sau 2.5 giây (Nguyên tắc Auto-dismiss)
        setTimeout(() => {
          setDeliveryState("idle");
          setRecoveryState("idle"); // Dọn luôn recovery nếu có
        }, 2500);
      }

    } catch (e) {
      // Nguyên tắc 4: Xử lý lỗi (Không tự ẩn để khách xử lý)
      console.error("Queue Error:", e);
      
      if (e.message === "network" || !navigator.onLine) {
        setDeliveryState("failed"); 
        processing = false;
        return; // Dừng vòng lặp để chờ mạng quay lại
      }

      // Xử lý Retry nếu là lỗi logic tạm thời từ server
      req.retries++;
      if (req.retries > 3) {
        queue.shift(); // Bỏ qua nếu lỗi quá nhiều lần
        saveQueue(queue);
      } else {
        saveQueue(queue);
        const delay = getRetryDelay(req.retries);
        setDeliveryState("queued"); 
        
        await new Promise(res => setTimeout(res, delay));
        // Tiếp tục vòng lặp while
      }
    }
  }

  processing = false;
}

/* ---------- RECOVERY ---------- */

export function detectRecovery() {
  const q = loadQueue();
  if (q.length > 0) {
    // Nếu có đơn cũ chưa gửi xong từ lần trước, báo cho khách biết
    setRecoveryState("found");
  }
}

/* ---------- EVENTS ---------- */

// Lắng nghe tín hiệu thử lại từ Banner
window.addEventListener("resumeQueue", () => {
  if (!processing) processQueue();
});

// Tự động resume khi mạng quay lại
window.addEventListener("online", () => {
  if (loadQueue().length > 0) {
    processQueue();
  }
});