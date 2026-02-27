// services/retryPolicy.js
//Chuẩn hoá chiến lược retry (dùng chung cho queue).
export function getRetryDelay(attempt){

  if(attempt <= 1) return 2000;
  if(attempt === 2) return 5000;
  if(attempt === 3) return 15000;

  return 45000; // ổn định lâu dài
}