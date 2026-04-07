/* ================= CONFIG ================= */

const SPREADSHEET_ID = "1ETw-fHK76jaM5c08pAjAXmqqYsjIMnr5GjhL280BNzk";

const SHEET_LIVE = "LIVE";
const SHEET_ARCHIVE = "ARCHIVE";
const SHEET_SECURITY = "SECURITY_LOG";
const API_SECRET = "HNV-2026";
const VALID_PLACES = [
  "olive","juniper","cloud","lounge","courtyard","dining",
  "pergola","t1","t2","t3","t4","garden"
];

/* ================= ENTRY ================= */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return json({ status: "error", message: "no_body" });
    
    const payload = JSON.parse(e.postData.contents);
    const data = parseData(payload);
    
    // Kiểm tra bảo mật & hợp lệ
    if (data.secret !== API_SECRET) return json({ status: "unauthorized" });
    if (!validate(data)) return json({ status: "invalid" });

    const sheet = getSheet(SHEET_LIVE);
    if (isDuplicate(sheet, data.id)) return json({ status: "duplicate" });

    const now = new Date();

    // Ghi dữ liệu vào 1 dòng theo đúng cấu trúc cột của bạn
    sheet.appendRow([
      data.id,                         // A: Order ID
      now,                             // B: Time
      data.mode,                       // C: Mode
      data.placeLabel,                 // D: Place
      JSON.stringify(data.items),      // E: Chi tiết món (JSON)
      data.totalQty,                   // F: Tổng số lượng (Quantity)
      data.totalPrice,                 // G: Tổng tiền
      getPriority(data.items[0]?.category), // H: Độ ưu tiên (lấy từ món đầu tiên)
      "NEW",                           // I: Trạng thái (Status)
      data.mode,                       // J: Action (send_cart)
      data.device                      // K: Device/Type
    ]);

    return json({ status: "ok", success: true, id: data.id });

  } catch (err) {
    logSecurity("System Error", { error: String(err) });
    return json({ status: "error", message: String(err) });
  }
}
/* ================= ENTRY: THEO DÕI (GET) ================= */
function doGet(e) {
  const action = e.parameter.action;

  // 1. Lấy trạng thái cho khách (syncOrdersWithServer)
  if (action === "getStatuses") {
  const idsParam = e.parameter.ids;
  if (!idsParam) return json({});

  const ids = idsParam.split(",");
  const sheet = getSheet(SHEET_LIVE);
  const data = sheet.getDataRange().getValues();

  const results = {};
  const wanted = new Set(ids);

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const id = String(row[0] || "");
    if (!wanted.has(id)) continue;

    let items = [];
    try {
      items = JSON.parse(row[4] || "[]");
      if (!Array.isArray(items)) items = [];
    } catch (e) {
      items = [];
    }

    results[id] = {
      id,
      time: row[1] || "",
      mode: row[2] || "",
      placeLabel: row[3] || "",
      items,
      totalQty: Number(row[5] || 0),
      totalPrice: Number(row[6] || 0),
      priority: row[7],
      status: row[8] || "NEW",
      type: row[9] || "",
      device: row[10] || ""
    };
  }

  return json(results);
}

  // 2. Cập nhật trạng thái (Dùng cho Admin nếu cần)
  if (action === "update") {
    const id = e.parameter.id;
    const status = e.parameter.status;
    const sheet = getSheet(SHEET_LIVE);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString() === id.toString()) {
        sheet.getRange(i + 1, 8).setValue(status); // Cột 9 là I
        return json({ success: true });
      }
    }
    return json({ success: false });
  }
}
// Hàm hỗ trợ cập nhật trạng thái vào Google Sheets
function updateOrderStatus(orderId, newStatus) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_LIVE);
  if (!sheet) return false;

  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === orderId.toString()) { 
      // Cập nhật tại cột I (cột thứ 9)
      sheet.getRange(i + 1, 9).setValue(newStatus); 
      return true;
    }
  }
  return false;
}

/* ================= DATA PARSER ================= */
function parseData(p) {
  const items = Array.isArray(p?.items) ? p.items : [];
  
  return {
    secret: p?.secret,
    id: p?.id || "",
    type: p?.type || "",
    timestamp: p?.timestamp || "",
    mode: p?.mode || "",
    place: p?.place || "",
    placeLabel: p?.placeLabel || "",
    device: p?.device || "",
    totalQty: p?.totalQty,
    totalPrice: p?.totalPrice,
    items: items.map(item => ({
      category: item.category || "",
      item: item?.item || "",
      option: item?.option || "",
      qty: Number(item?.qty || 0),
      price: Number(item?.price || 0)
    }))
  };
}

/* ================= VALIDATION ================= */
function validate(data) {
  if (!data || typeof data !== "object") return false;
  if (!data.place || !VALID_PLACES.includes(data.place)) return false;
  if (!Array.isArray(data.items) || data.items.length === 0) return false;

  for (const item of data.items) {
    if (!item || typeof item !== "object") return false;
  }

  return true;
}
/* ================= SAVE ================= */
function saveCart(data) {
  return doPost({
    postData: {
      contents: JSON.stringify(data)
    }
  });
}
/* ================= DUPLICATE ================= */

function isDuplicate(sheet, id) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  const ids = sheet
    .getRange(2, 1, lastRow - 1, 1)
    .getValues()
    .flat();
  return ids.includes(id);
}

/* ================= RATE LIMIT ================= */

function isRateLimited(place) {
  const cache = CacheService.getScriptCache();
  const key = "rate_" + place;
  if (cache.get(key)) return true;
  cache.put(key, "1", 5); // 5 giây
  return false;
}

/* ================= PRIORITY ================= */

function getPriority(category) {
  if (category === "help") return "URGENT";
  if (category === "payment") return "URGENT";
  if (category === "service") return "HIGH";
  if (category === "food" ) return "NORMAL";
  if (category === "drink") return "NORMAL";
  return "ASK";
}

/* ================= HELPERS ================= */

function getSheet(name) {
  return SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName(name);
}

/* ================= SECURITY ================= */

function logSecurity(type, data) {
  const sheet = getSheet(SHEET_SECURITY);
  if (!sheet) return;
  sheet.appendRow([
    new Date(),
    type,
    JSON.stringify(data).slice(0, 500)
  ]);
}

/* ================= RESPONSE ================= */

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}


/**
 * Tự động chuyển các đơn hàng đã hoàn tất sang kho lưu trữ (ARCHIVE)
 * Giúp sheet LIVE luôn nhẹ và mượt.
 */
function archiveOrder() {
  const liveSheet = getSheet(SHEET_LIVE);
  const archiveSheet = getSheet(SHEET_ARCHIVE);
  
  if (!liveSheet || !archiveSheet) return;

  const data = liveSheet.getDataRange().getValues();
  // Nếu chỉ có dòng tiêu đề thì thoát
  if (data.length < 2) return;

  // Duyệt ngược từ dưới lên để việc xóa dòng không làm nhảy index
  for (let i = data.length - 1; i >= 1; i--) {
    const row = data[i];
    const status = row[8]; // Cột I - Trạng thái

    if (status === "DONE") {
      // 1. Chép dòng này sang sheet ARCHIVE
      archiveSheet.appendRow([...row, new Date()]);
      
      // 2. Xóa dòng này khỏi sheet LIVE
      liveSheet.deleteRow(i + 1); 
      
      console.log("Đã lưu trữ đơn hàng ID: " + row[0]);
    }
  }
}





