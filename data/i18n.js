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
    add_to_order: { vi: "Thêm yêu cầu", en: "Add to order" },
    send_request: { vi: "Gửi yêu cầu", en: "Send request" },
    empty: { vi: "Giỏ hàng đang trống", en: "Your cart is empty" },
    confirm_changes: { vi: "XÁC NHẬN THAY ĐỔI", en: "CONFIRM CHANGES" },
    send_order: { vi: "GỬI YÊU CẦU NGAY", en: "SEND ORDER NOW" },
    close: { vi: "Đóng", en: "Close" },
    place_prompt: { vi: "Chọn vị trí", en: "Select a place" },
    sending: { vi: "Đang gửi...", en: "Sending..." },
    success: { vi: "Đã gửi thành công", en: "Sent successfully" },
    added: { vi: "Đã thêm vào giỏ hàng", en: "Added to cart" },
    error: { vi: "Chưa gửi được", en: "Failed to send" },
    success_cart: { vi: "Đơn hàng đã được gửi", en: "The order has been shipped." },
    success_instant: { vi: "Yêu cầu đã được gửi", en: "The request has been submitted." },
    added_cart: { vi: "Đã thêm vào giỏ hàng", en: "Added to cart" },
    error_cart: { vi: "Chưa gửi được", en: "Failed to send" }

  },

  order: {
    other: { vi: "Đơn hàng khác", en: "Other orders" },
    confirm: { vi: "Xác nhận", en: "Confirm" },
    cancel: { vi: "Hủy", en: "Cancel" },
    status: { vi: "Trạng thái", en: "Status" },
    order_id: { vi: "Mã đơn hàng", en: "Order ID" },
    current_status: { vi: "Tiến độ dịch vụ", en: "Service Progress" },
    success_title: { vi: "Đặt đơn thành công", en: "Order Placed" },
    success_msg: { vi: "Yêu cầu của bạn đã được chuyển tới bộ phận liên quan.", en: "Your request has been sent to the relevant department." },
    check_detail: { vi: "Kiểm tra ❯", en: "Check ❯" },
    no_active_order: { vi: "Bạn không có đơn hàng nào đang xử lý.", en: "No active orders at the moment." }
  },
  status: {
    NEW: { vi: "Tiếp nhận", en: "Received" },
    COOKING: { vi: "Chuẩn bị", en: "Preparing" },
    DELIVERING: { vi: "Đang tới", en: "Delivering" },
    DONE: { vi: "Hoàn tất", en: "Completed" },
    RECOVERING: { vi: "Đang dọn dẹp", en: "Recovering" },
    // Tin nhắn thông báo nhanh trên Status Bar
    msg_NEW: { vi: "Đang tiếp nhận yêu cầu...", en: "Receiving your request..." },
    msg_COOKING: { vi: "Bếp đang chuẩn bị món...", en: "Kitchen is preparing..." },
    msg_DELIVERING: { vi: "Đang mang tới phòng của bạn...", en: "On the way to your room..." },
    msg_RECOVERING: { vi: "Đang phục hồi sự tĩnh lặng...", en: "Restoring the serenity..." }
  },
  place: {
    button_nav:{ vi: "Chọn vị trí", en: "Select a place"},
    select: { vi: "Chọn nơi phục vụ?", en: "Where would you like to be served?" },
    my_room: { vi: "Phòng tôi", en: "My room" },
    my_table: { vi: "Bàn tôi", en: "My table" },
    my_area: { vi: "Khu vực tôi", en: "My area" },
    served: { vi: "Phục vụ tại", en: "Served at" },
    hello: { vi: "Haven Xin chào!", en: "Haven Hello!" }
  },
  mode: {
    in_room: { vi: "Tại phòng", en: "In room" },
    room: { vi: "Phòng", en: "Room" },
    table: { vi: "Bàn", en: "Tables" },
    area: { vi: "Khu vực", en: "Areas" },
    guest: { vi: "Khách", en: "Guest" },
    table_guest: { vi: "Khách bàn", en: "Table guest" },
    area_guest: { vi: "Khách khu vực", en: "Area guest" }
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
