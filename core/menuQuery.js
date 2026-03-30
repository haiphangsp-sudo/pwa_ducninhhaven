// core/menuQuery.js

import { getContext } from "./context.js";
import { translate } from "../ui/utils/translate.js";
import { getState } from "../../core/state.js";


/**
 * Helper: Luôn lấy dữ liệu mới nhất từ State mỗi khi hàm được gọi
 */
const getMenuData = () => getState().menu.data || {};


function getPlace() {
    
    const ctx = getContext();
    const anchor=ctx?.anchor;
    if(!anchor) return "table";
    return anchor.type;
}
export function getCategory(key) {
  const menuData = getMenuData();
  return menuData[key] || null;
}


export function getVariants(categoryKey, productKey) {
  const menuData = getMenuData();
  const product = menuData[categoryKey].products?.[productKey];
  if (product?.active===false) return [];

  return Object.entries(product.variants || {})
    .filter(([, variant]) => variant.active !== false)
    .map(([key, variant]) => ({
      key,
      ...variant,
      recommend: (product.recommend || []).includes(key)
    }));
}



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
  if (!categoryKey) return [];
  
  const menuData = getMenuData(); // Gọi hàm helper để lấy data mới nhất
  const category = menuData[categoryKey];
  
  if (!category || category.active === false) return [];

  // menuSchema đã chuẩn hóa items -> products
  const products = category.products || {};

  return Object.entries(products)
    .filter(([, product]) => product?.active !== false)
    .map(([key, product]) => ({
      ...product,
      key
    }));
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
export function getDrawerExtended(state) {
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
export function getCartExtended(state, type) {
  if (type !== "cart" && type !== "instant") return null;

  let rawItems = [];
  if (type === "cart") rawItems = state.cart?.items || [];
  if (type === "instant") {
    const lineId = state.order?.line;
    rawItems = lineId ? [{ id: lineId, qty: 1 }] : [];
  }

  if (rawItems.length === 0) return null;

  let totalAmount = 0;
  let totalQty = 0;

  // 1. Chi tiết hóa từng món
  const detailedItems = rawItems.map(cartItem => {
    const info = getVariantById(cartItem.id);
    if (!info) return null;

    const linePrice = info.price * cartItem.qty;
    totalAmount += linePrice;
    totalQty += cartItem.qty;

    return {
      ...cartItem,
      label: `${translate(info.productLabel)} - ${translate(info.varianLabel)}`,
      price: info.price,
      linePrice
    };
  }).filter(Boolean);

  // 2. Tạo chuỗi tóm tắt cho Google Sheets (Ví dụ: "1x Phở bò - Tô lớn")
  const itemsSummary = detailedItems
    .map(i => `${i.qty}x ${i.label}`)
    .join(", ");

  // 3. Trả về Object "2 trong 1"
  return {
    // Nhóm 1: Dữ liệu chuẩn để gửi GAS (Khớp với GS_2.js)
    payload: {
      id: `HNV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      place: state.context.active?.id || "",
      type: type === "instant" ? "⚡ Mua ngay" : "🛒 Giỏ hàng",
      items: itemsSummary, // Đây là chuỗi văn bản cho cột E
      total: totalAmount,  // Đây là con số cho cột F
      notes: state.order?.notes || "",
      lang: state.lang?.current || "vi"
    },

    // Nhóm 2: Dữ liệu để Render UI (Drawer)
    display: {
      items: detailedItems,
      totalQty: totalQty,
      totalPriceFormat: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount),
      itemUnique: `${detailedItems.length} ${translate("cart_bar.unique")}`
    }
  };
}