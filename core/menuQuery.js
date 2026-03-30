// core/menuQuery.js

import { getState } from "./state.js";
import { translate } from "../ui/utils/translate.js";

/**
 * Helper: Luôn lấy dữ liệu mới nhất từ State mỗi khi hàm được gọi
 */
const getMenuData = () => getState().menu.data || {};

/**
 * Lấy danh mục (Categories) phù hợp với vị trí khách đang đứng
 */
export function getCategories() {
  const menuData = getMenuData();
  const currentPlaceType = getState().context.active?.type || "table"; 
  const out = [];

  for (const [key, cat] of Object.entries(menuData)) {
    if (cat.active === false) continue;
    
    // Kiểm tra quyền truy cập (ví dụ: Spa chỉ cho Room, không cho Table)
    if (cat.allow && !cat.allow.includes(currentPlaceType)) continue;

    out.push({
      key,
      label: cat.label,
      ui: cat.ui,
      icon: cat.icon
    });
  }
  return out;
}

/**
 * Lấy danh sách sản phẩm trong một Category
 */
export function getProducts(categoryKey) {
  const category = getMenuData()[categoryKey];
  if (!category || category.active === false) return [];

  const out = [];
  // menuSchema đã đổi items -> products
  const products = category.products || {};

  for (const [key, product] of Object.entries(products)) {
    if (product.active === false) continue;
    out.push({ ...product, key });
  }
  return out;
}

/**
 * TRÍ TRÍ QUAN TRỌNG: Truy tìm thông tin chi tiết từ một ID duy nhất
 * Dùng cho Giỏ hàng và Mua ngay
 */
export function getVariantById(id) {
  const menuData = getMenuData();

  for (const [catKey, cat] of Object.entries(menuData)) {
    const products = cat.products || {};
    
    for (const [prodKey, prod] of Object.entries(products)) {
      const variants = prod.variants || {};
      
      for (const [varKey, variant] of Object.entries(variants)) {
        if (variant.id === id) {
          return {
            id: variant.id,
            categoryKey: catKey,
            productKey: prodKey,
            variantKey: varKey,
            // Đã dịch sẵn để UI chỉ việc hiển thị
            productLabel: translate(prod.label),
            variantLabel: translate(variant.label),
            price: Number(variant.price || 0),
            priceFormat: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(variant.price),
            unit: variant.unit || "item",
            ui: cat.ui || "cart"
          };
        }
      }
    }
  }
  return null;
}

/**
 * BIẾN ĐỔI GIỎ HÀNG: Từ mảng {id, qty} thành dữ liệu hiển thị Drawer
 */
export function getCartExtended(state) {
  const items = state.cart?.items || [];
  let totalP = 0;
  let totalQ = 0;

  const detailedItems = items.map(cartItem => {
    const info = getVariantById(cartItem.id);
    if (!info) return null;

    const linePrice = info.price * cartItem.qty;
    totalP += linePrice;
    totalQ += cartItem.qty;

    return { 
        ...cartItem, 
        ...info, 
        linePrice,
        linePriceFormat: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(linePrice)
    };
  }).filter(Boolean);

  return {
    items: detailedItems,
    isEmpty: detailedItems.length === 0,
    itemUnique: `${detailedItems.length} ${translate("cart_bar.unique")}`,
    totalQty: totalQ,
    totalPrice: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalP)
  };
}