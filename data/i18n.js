// data/i18n.js
//Toàn bộ chữ hiển thị cho khách.
export const STRINGS = {
  
  recovery: {
    found: { vi: "Bạn có yêu cầu chưa gửi. Chạm để gửi lại.", en: "Unsent request found. Tap to resend." },
    sending: { vi: "Đang gửi lại...", en: "Resending..." },
    done: { vi: "Đã gửi thành công", en: "Sent successfully" },
    discarded: { vi: "Đã huỷ yêu cầu", en: "Request discarded" }
  },
  delivery: {
    pending: { vi: "Đang gửi...", en: "Sending..." },
    ack_success: { vi: "Đã ghi nhận", en: "Received" },
    sent: { vi: "Đã gửi tới bếp", en: "Sent to kitchen" },
    delivered: { vi: "Đã hoàn tất", en: "Completed" },
    failed: { vi: "Không gửi được — sẽ thử lại", en: "Failed — will retry" }
  },
  cart_bar: {
    cart_title: { vi: "Giỏ hàng", en: "View cart" },
    unique: { vi: "món", en: "dishes" },
    item: { vi: "phần", en: "item" },
    items: { vi: "phần", en: "items" },
    order: { vi: "Gửi", en: "Order" },
    free: { vi: "Miễn phí", en: "Free" },
    instant: { vi: "Dịch vụ tức thời", en: "Instant service" },
    add_to_order: { vi: "Thêm vào yêu cầu", en: "Add to order" },
    send_request: { vi: "Gửi yêu cầu", en: "Send request" },
    empty: { vi: "Giỏ hàng đang trống", en: "Your cart is empty" },
    confirm_changes: { vi: "XÁC NHẬN THAY ĐỔI", en: "CONFIRM CHANGES" },
    send_order: { vi: "GỬI YÊU CẦU NGAY", en: "SEND ORDER NOW" }
  },

  select_place: { vi: "Chọn vị trí phục vụ", en: "Select service location" },
  place:{
    my_room: { vi: "Phòng tôi", en: "My room" },
    my_table: { vi: "Bàn tôi", en: "My table" },
    my_area: { vi: "Khu vực tôi", en: "My area" }
  },
    in_room: { vi: "Tại phòng", en: "In room" },
    room: { vi: "Phòng", en: "Room" },
    table: { vi: "Bàn", en: "Tables" },
    area: { vi: "Khu vực", en: "Areas" },
    guest: { vi: "Khách", en: "Guest" },
    table_guest: { vi: "Khách bàn", en: "Table guest" },
    area_guest: { vi: "Khách khu vực", en: "Area guest" },
    haven: { vi: "Haven", en: "Haven" },
    sending: {
      vi: "Đang gửi yêu cầu…",
      en: "Sending request…"
    },
    received: {
      vi: "Chúng tôi đã nhận yêu cầu",
      en: "We’ve received your request"
    },
    connection_lost: {
      vi: "Mất kết nối. Yêu cầu sẽ được gửi sớm",
      en: "Connection lost. We’ll deliver your request shortly"
    },
    unable_send: {
      vi: "Không thể gửi. Vui lòng thử lại",
      en: "Unable to send. Please try again"
    }
  }
