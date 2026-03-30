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
export function getCartExtended(state) {
  let items = [];
  const type = state.order.type;

  if (type === "cart") {
    items = state.cart?.items || [];
  } else {
    items = state.order?.line ? [state.order?.line] : [];
  }

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

export function getCartExtendedNew(state, type) {
  const { line } = state.order;
  const { items: cartItems } = state.cart;

  // 1. Xác định danh sách món cần xử lý
  // Nếu là instant: tạo mảng ảo từ state.order.line
  // Nếu là cart: lấy từ giỏ hàng
  const rawItems = (type === "instant" && line) 
    ? [{ id: line, qty: 1 }] 
    : (cartItems || []);

  if (rawItems.length === 0) return null;

  // 2. Chi tiết hóa dữ liệu từng món
  let totalPrice = 0;
  const detailedItems = rawItems.map(item => {
    const info = getVariantById(item.id); // Hàm Category > Item > Option của bạn
    if (!info) return null;

    totalPrice += info.price * item.qty;
    return {
      ...item,
      label: `${translate(info.itemLabel)} - ${translate(info.optionLabel)}`,
      price: info.price,
      subtotal: info.price * item.qty
    };
  }).filter(Boolean);

  // 3. Đóng gói Payload theo chuẩn GAS 
  return {
    id: `HNV-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Order ID cho GAS
    place: state.context.active?.id || "",
    type: type === "instant" ? "⚡ Mua ngay" : "🛒 Giỏ hàng",
    items: detailedItems.map(i => `${i.qty}x ${i.label}`).join(", "),
    total: totalPrice,
    notes: state.order.notes || "",
    lang: state.lang.current
  };
}
