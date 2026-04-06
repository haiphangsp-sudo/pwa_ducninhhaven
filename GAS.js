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
    if (!e || !e.postData || !e.postData.contents ) {
      logSecurity("Debug Raw", {contents:e.postData? e.postData.contents:"null"});
      return json({ status: "error", message: "no_body" });
    }
    const payload = JSON.parse(e.postData.contents);
    const data = parseData(payload);
    
    if (data.secret !== API_SECRET) {
      logSecurity("Unauthorized", data);
      return json({ status: "unauthorized" });
    }
    
    if (!validate(data)) {
      logSecurity("Invalid", data);
      return json({ status: "invalid" });
    }

    const sheet = getSheet(SHEET_LIVE);

    if (isDuplicate(sheet, data.id)) {
      logSecurity("Duplicate",data);
      return json({ status: "duplicate" });
    }

    if (isRateLimited(data.place)) {
      logSecurity("RateLimited",data)
      return json({ status: "rate_limited" });
    }
      saveCart(data);

    return json({ status: "ok" });

  } catch (err) {

    logSecurity("System Error", { error: String(err) });
    return json({ status: "error", message: String(err) });
  }
}
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === "getStatuses") {
    const ids = e.parameter.ids.split(",");
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_LIVE);
    const data = sheet.getDataRange().getValues(); // Lấy toàn bộ data
    
    const results = {};
    
    // Duyệt qua danh sách ID khách gửi lên
    ids.forEach(id => {
      // Tìm dòng có ID tương ứng (ID ở cột A, Trạng thái ở cột J)
      const row = data.find(r => r[0] == id);
      if (row) {
        results[id] = row[9]; // Trả về trạng thái hiện tại trong Sheets
      }
    });
    if (action === "update") {
    const id = e.parameter.id;
    const status = e.parameter.status;
    const success = updateOrderStatus(id, status);
    return ContentService.createTextOutput(JSON.stringify({success: success}))
           .setMimeType(ContentService.MimeType.JSON);
  }
    
    return ContentService.createTextOutput(JSON.stringify(results))
      .setMimeType(ContentService.MimeType.JSON);
  }
  if (action === "update") {
    const id = e.parameter.id;
    const status = e.parameter.status;
    const success = updateOrderStatus(id, status);
    return ContentService.createTextOutput(JSON.stringify({success: success}))
           .setMimeType(ContentService.MimeType.JSON);
  }
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


// xử lý việc cập nhật trạng thái từ PWA
function updateOrderStatus(orderId, newStatus) {
  const sheet = getSheet(SHEET_LIVE);
  const data = sheet.getDataRange().getValues();
  
  // Tìm dòng có ID tương ứng
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == orderId) { // Cột A là ID
      // Cập nhật giá trị tại cột J (index 9)
      sheet.getRange(i + 1, 10).setValue(newStatus); 
      return true;
    }
  }
  return false;
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





