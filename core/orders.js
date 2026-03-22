// core/orders.js

export function startPollingOrders() {
    setInterval(async () => {
        const { active } = getState().orders;
        
        // CHỈ LỌC các đơn hàng chưa hoàn thành (Done hoặc Cancelled)
        const pendingIds = active
            .filter(order => order.status !== 'done' && order.status !== 'cancelled')
            .map(order => order.id);

        if (pendingIds.length === 0) return; // Không có đơn nào đang chờ thì nghỉ

        // Gửi danh sách ID này lên Google Script
        const updates = await fetchOrderUpdates(pendingIds);
        
        if (updates) {
            updateOrderStates(updates);
        }
    }, 30000); // 30 giây hỏi một lần là vừa đẹp
}