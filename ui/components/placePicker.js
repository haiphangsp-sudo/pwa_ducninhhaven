// ui/components/placePicker.js
import { setState, getState } from "../../core/state.js";

/**
 * Mở bộ chọn vị trí bằng cách thay đổi State
 */
export function openPicker() {
    setState({ view: { overlay: 'placePicker' } });
}

/**
 * Đóng bộ chọn vị trí
 */
export function closePicker() {
    setState({ view: { overlay: null } });
}

/**
 * Xử lý khi khách chọn một phòng/bàn cụ thể
 */
export function selectPlace(placeId) {
    // 1. Cập nhật vị trí đang hoạt động
    // 2. Tự động đóng overlay sau khi chọn xong
    setState({ 
        context: { active: { id: placeId } },
        view: { overlay: null } 
    });
    
    console.log(`Haven Logic: Đã đổi vị trí sang ${placeId}`);
}