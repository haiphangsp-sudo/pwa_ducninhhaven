const VND_FORMATTER = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND"
});

export function formatPrice(price) {
  if (price == null || isNaN(price)) return "";

  return VND_FORMATTER.format(price);
}