
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