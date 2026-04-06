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

/* ================= ENTRY: ĐẶT MÓN (POST) ================= */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json({ status: "error", message: "no_body" });
    }
    const data = JSON.parse(e.postData.contents);
    
    // Kiểm tra bảo mật
    if (data.secret !== API_SECRET) return json({ status: "unauthorized" });

    const sheet = getSheet(SHEET_LIVE);
    
    // Ghi dòng mới (Giả sử cột A là ID, cột J là Trạng thái mặc định NEW)
    // Cấu trúc appendRow phụ thuộc vào bảng của bạn, đây là ví dụ:
    sheet.appendRow([
      data.id,           // A: ID đơn hàng
      new Date(),        // B: Thời gian
      data.placeLabel,   // C: Vị trí
      JSON.stringify(data.items), // D: Chi tiết món
      "", "", "", "", "", // E, F, G, H, I: Để trống hoặc info khác
      "NEW"              // J: Trạng thái mặc định
    ]);

    return json({ success: true, id: data.id });
  } catch (err) {
    return json({ status: "error", message: err.message });
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

    ids.forEach(id => {
      // Tìm ID ở cột A (index 0), lấy status ở cột J (index 9)
      const row = data.find(r => r[0].toString() === id.toString());
      if (row) results[id] = row[9] || "NEW";
    });

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
        sheet.getRange(i + 1, 10).setValue(status); // Cột 10 là J
        return json({ success: true });
      }
    }
    return json({ success: false });
  }
}

/* ================= HELPERS ================= */
function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Hàm hỗ trợ cập nhật trạng thái vào Google Sheets
function updateOrderStatus(orderId, newStatus) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_LIVE);
  if (!sheet) return false;

  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === orderId.toString()) { 
      // Cập nhật tại cột J (cột thứ 10)
      sheet.getRange(i + 1, 10).setValue(newStatus); 
      return true;
    }
  }
  return false;
}

/* ================= DATA PARSER ================= */

function parseData(p) {
  return {
    secret: p?.secret,
    id: p?.id || "",
    type: p?.type || "",
    timestamp: p?.timestamp || "",
    mode: (p?.mode || ""),
    place: (p?.place || ""),
    placeLabel:p?.placeLabel,
    device: p?.device || "",
    items: Array.isArray(p?.items)
      ? p.items.map(item => ({
          id: item?.id || "",
          category: item?.category || "",
          item: item?.item || "",
          option: item?.option || "",
          qty: Number(item?.qty || 0),
          price: Number(item?.price || 0)
        }))
      : []
  };
}

/* ================= VALIDATION ================= */
function validate(data) {
  if (!data || typeof data !== "object") return false;
  if (!data.place || !VALID_PLACES.includes(data.place)) return false;
  if (!Array.isArray(data.items) || data.items.length === 0) return false;

  for (const item of data.items) {
    if (!item || typeof item !== "object") return false;
    if (!item.id || typeof item.id !== "string") return false;
  }

  return true;
}
/* ================= SAVE ================= */

function saveCart(data) {
  const sheet = getSheet(SHEET_LIVE);
  const now = new Date();
  const items = Array.isArray(data.items) ? data.items : [];

  if (items.length === 0) {
    return json({ status: "invalid", message: "empty_items" });
  }

  const rows = items.map(it => [
    data.id || "",                  // request_id
    now,                            // server_time
    data.mode || "",
    data.placeLabel || "",
    it.category || "",
    it.item || "",
    it.option || "",
    Number(it.qty || 0),
    getPriority(it.category),
    "NEW",
    data.type || "",
    data.device || ""
  ]);

  sheet
    .getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length)
    .setValues(rows);

  return json({ status: "success" });
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
    const status = row[9]; // Cột J - Trạng thái

    if (status === "DONE") {
      // 1. Chép dòng này sang sheet ARCHIVE
      archiveSheet.appendRow([...row, new Date()]);
      
      // 2. Xóa dòng này khỏi sheet LIVE
      liveSheet.deleteRow(i + 1); 
      
      console.log("Đã lưu trữ đơn hàng ID: " + row[0]);
    }
  }
}





