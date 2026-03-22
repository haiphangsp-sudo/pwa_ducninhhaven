/* ================= CONFIG ================= */

const SPREADSHEET_ID = "1ETw-fHK76jaM5c08pAjAXmqqYsjIMnr5GjhL280BNzk";

const SHEET_LIVE = "LIVE";
const SHEET_ARCHIVE = "ARCHIVE";
const SHEET_SECURITY = "SECURITY_LOG";
const API_SECRET = "HNV-2026";
const VALID_PLACES = [
  "Olive","Juniper","Cloud","Lounge","Courtyard","Dining",
  "Pergola","T1","T2","T3","T4","Garden"
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


/* ================= DATA PARSER ================= */

function parseData(p) {
  return {
    secret: p.secret,
    id: p.id,
    type: p.type,
    mode: p.mode,
    place: p.place,
    category: p.category,
    items: Array.isArray(p.items) ? p.items : [], 
    option: p.option,
    qty: p.qty,
    device: p.device
  };
}

/* ================= VALIDATION ================= */
function validate(data) {
  if (!data.place || !VALID_PLACES.includes(data.place)) return false;
  if (!Array.isArray(data.items) || data.items.length === 0) return false;
  return true;
}
/* ================= SAVE ================= */

function saveCart(data) {
  const sheet = getSheet(SHEET_LIVE);
  const now = new Date();
  const items = data.items || [];
  const rows = items.map(it => [
    data.id,
    now,
    data.mode,
    data.place,
    it.category,
    it.item,
    it.option,
    it.qty,
    getPriority(it.category),
    "NEW",
    data.type,
    data.device
  ]);

  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
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

/* ================= SHEET ================= */

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



