// data/i18n.js
//Toàn bộ chữ hiển thị cho khách.
export const STRINGS = {
  
  recovery: {
    found: { vi: "Bạn có yêu cầu chưa gửi. Chạm để gửi lại.", en: "Unsent request found. Tap to resend." },
    sending: { vi: "Đang gửi lại...", en: "Resending..." },
    done: { vi: "Đã gửi thành công", en: "Sent successfully" },
    discarded: { vi: "Đã huỷ yêu cầu", en: "Request discarded" }
  },
    
  button: {
    place_prompt: { vi: "Chọn vị trí", en: "Select a place" },
    offline_retry: { vi: "Mất mạng, sẽ tự gửi lại", en: "Offline, will retry automatically"},
    queued: { vi: "Đã lưu, chờ gửi...", en: "Saved, waiting to send..."},
    send_order: { vi: "GỬI YÊU CẦU NGAY", en: "SEND ORDER NOW" },
    close: { vi: "Đóng", en: "Close" },
    empty: { vi: "Giỏ hàng đang trống", en: "Your cart is empty" },
    sending: { vi: "Đang gửi...", en: "Sending..." },
    confirm_changes: { vi: "XÁC NHẬN THAY ĐỔI", en: "CONFIRM CHANGES" },

  },
  toast: {
    success: { vi: "Đã gửi thành công", en: "Sent successfully" },
    error: { vi: "Chưa gửi được", en: "Failed to send" },
    duplicate: { vi: "Đã gửi trước đó", en: "Already sent" },
    added: { vi: "Đã thêm vào giỏ hàng", en: "Added to cart" },
    removed: { vi: "Đã xóa khỏi giỏ hàng", en: "Removed from cart" },
    idle:{ vi: "Giỏ hàng trống", en: "Cart is empty"},
    undo_success: { vi: "Thu hồi thành công", en: "Successful recall" },
    undo_failed: { vi: "Thu hồi thất bại", en: "Recall failed" },
    order_pending: {vi: "Đơn hàng đang được gửi, vui lòng đợi trong giây lát!",en: "Your order is being sent, please wait!"},
    sent: { vi: "Đã gửi tới bếp", en: "Sent to kitchen" },
    failed: { vi: "Không gửi được — sẽ thử lại", en: "Failed — will retry" },
    sending: { vi: "Đang gửi...", en: "Sending..." },
    pending: { vi: "Đang xử lý...", en: "Processing..." },
    queued: { vi: "Đã lưu, chờ gửi", en: "Saved, waiting to send" }
  },
  cart_bar: {
    cart_title: { vi: "Giỏ hàng", en: "View cart" },
    unique: { vi: "món", en: "dishes" },
    item: { vi: "phần", en: "item" },
    items: { vi: "phần", en: "items" },
    order: { vi: "Gửi", en: "Order" },
    free: { vi: "Miễn phí", en: "Free" },
    instant: { vi: "Dịch vụ tức thời", en: "Instant service" },
    success_cart: { vi: "Đơn hàng đã được gửi", en: "The order has been shipped." },
    success_instant: { vi: "Yêu cầu đã được gửi", en: "The request has been submitted." }
  },
  menu: {
    detail: { vi: "Chi tiết", en: "Details" },
    add_to_order: { vi: "Thêm yêu cầu", en: "Add to order" },
    send_request: { vi: "Gửi yêu cầu", en: "Send request" }

  },
  order: {
    other: { vi: "Đơn hàng khác", en: "Other orders" },
    button: { vi: "Xem đơn", en: "View orders" },
    check: { vi: "Kiểm tra đơn hàng...", en: "Check order..." },
    confirm: { vi: "Xác nhận", en: "Confirm" },
    cancel: { vi: "Hủy", en: "Cancel" },
    status: { vi: "Trạng thái đơn hàng.", en: "Order status." },
    history_title: { vi: "Lịch sử đơn hàng", en: "Order history" },
    active_title: { vi: "Đơn hàng đang xử lý", en: "Active orders" },
    order_id: { vi: "Mã đơn hàng", en: "Order ID" },
    current_status: { vi: "Tiến độ dịch vụ", en: "Service Progress" },
    time: { vi: "Thời gian", en: "Time" },
    place: { vi: "Vị trí", en: "Place" },
    items: { vi: "Món", en: "Items" },
    total: { vi: "Tổng đơn hàng", en: "Total order" },
    unnamed_item: { vi: "Mục chưa tên", en: "Unnamed item" },
    quantity: { vi: "Số lượng", en: "Quantity" },
    price: { vi: "Giá", en: "Price" },
    service_request: { vi: "Yêu cầu phục vụ", en: "Service request" },
    syncing_msg: { vi: "Đang đồng bộ dữ liệu...", en: "Syncing data..." },
    sending: { vi: "Đang gửi...", en: "Sending..." },
    success_title: { vi: "Đặt đơn thành công", en: "Order Placed" },
    success_msg: { vi: "Yêu cầu của bạn đã được chuyển tới bộ phận liên quan.", en: "Your request has been sent to the relevant department." },
    check_detail: { vi: "Kiểm tra", en: "Check" },
    no_active_order: { vi: "Bạn không có đơn hàng nào đang xử lý.", en: "No active orders at the moment." }
  },
status: {
  NEW: {vi: "Tiếp nhận",en: "Received"},
  COOKING: {vi: "Chuẩn bị",en: "Preparing"},
  DELIVERING: {vi: "Đang tới",en: "Delivering"},
  DONE: {vi: "Hoàn tất",en: "Completed"},
  RECOVERING: {vi: "Khôi phục",en: "Recovering"},
  SYNCING: {vi: "Đang đồng bộ",en: "Syncing"},
  msg_NEW: {vi: "Tiếp nhận yêu cầu...",en: "Receiving your request..."},
  msg_COOKING: {vi: "Đang chuẩn bị...",en: "Preparing your request..."},
  msg_DELIVERING: {vi: "Đang mang tới...",en: "On the way..."},
  msg_DONE: {vi: "Đã hoàn tất",en: "Completed"},
  msg_RECOVERING: {vi: "Đang khôi phục...",en: "Restoring..."},
  msg_SYNCING: {vi: "Đang đồng bộ trạng thái...",en: "Syncing status..."},
  
  msg_long_NEW: {
    vi: "Yêu cầu của bạn đã được ghi nhận và đang được chuyển tới bộ phận phụ trách.",
    en: "Your request has been received and is being routed to the appropriate team."
  },
  msg_long_COOKING: {
    vi: "Bộ phận phục vụ đang chuẩn bị yêu cầu của bạn. Thời gian xử lý có thể thay đổi tùy theo loại dịch vụ.",
    en: "Our team is preparing your request. Timing may vary depending on the type of service."
  },
  msg_long_DELIVERING: {
    vi: "Yêu cầu của bạn đang được mang tới vị trí phục vụ. Vui lòng chờ trong giây lát.",
    en: "Your request is on the way to your selected location. Please allow us a few moments."
  },
  msg_long_DONE: {
    vi: "Yêu cầu đã được hoàn tất. Nếu bạn cần thêm hỗ trợ, Haven luôn sẵn sàng phục vụ.",
    en: "Your request has been completed. If you need anything else, Haven is always ready to assist."
  },
  msg_long_RECOVERING: {
    vi: "Hệ thống đang khôi phục thông tin đơn hàng để tiếp tục theo dõi chính xác hơn.",
    en: "The system is restoring your order information so tracking can continue more accurately."
    },

  msg_long_SYNCING: {
    vi: "Đơn hàng đang được đồng bộ với hệ thống để hiển thị trạng thái chính xác hơn.",
    en: "Your order is being synced with the system so progress can be shown accurately."
  },
  tracker_note: {
    vi: "Tiến độ được cập nhật theo từng bước phục vụ.",
    en: "Progress is updated as your request moves through service."
  },
  support_note: {
    vi: "Nếu cần điều chỉnh đơn hàng, vui lòng liên hệ bộ phận hỗ trợ.",
    en: "If you need to adjust your request, please contact support."
  }
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
  
  received: {vi: "Chúng tôi đã nhận yêu cầu",en: "We’ve received your request"},
  connection_lost: {vi: "Mất kết nối. Yêu cầu sẽ được gửi sớm",en: "Connection lost. We’ll deliver your request shortly"},
  unable_send: {vi: "Không thể gửi. Vui lòng thử lại",en: "Unable to send. Please try again"}
}
