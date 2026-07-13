/**
 * INSTRUKSI DEPLOYMENT (PENTING):
 * 1. Buka https://script.google.com/
 * 2. Buka project script yang sudah Anda buat sebelumnya.
 * 3. Hapus kode lama, lalu paste/tempel semua kode baru di bawah ini.
 * 4. Klik Save (icon disket).
 * 5. Klik "Deploy" > "Manage deployments".
 * 6. Klik icon pensil (Edit) di deployment Anda.
 * 7. Pada tulisan "Version", ubah dari "1" ke "New version".
 * 8. Klik "Deploy" lagi.
 * 9. Selesai!
 */

function doPost(e) {
  try {
    // Parsing data JSON yang dikirim dari form HTML/Next.js
    var data = JSON.parse(e.postData.contents);
    
    // Cek action: jika "validate" jalankan validasi tiket, jika "getParticipants" ambil data, jika tidak maka registrasi
    if (data.action === "validate") {
      return handleValidation(data);
    } else if (data.action === "getParticipants") {
      return handleGetParticipants();
    } else if (data.action === "getAdminData") {
      return handleGetAdminData();
    } else if (data.action === "updatePaymentStatus") {
      return handleUpdatePaymentStatus(data);
    }
    
    return handleRegistration(data);
    
  } catch (error) {
    // Tangani error global
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleValidation(data) {
  var sheetName = "Data Pendaftar Event";
  var files = DriveApp.getFilesByName(sheetName);
  
  if (!files.hasNext()) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": "Database Spreadsheet belum dibuat"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var spreadsheet = SpreadsheetApp.open(files.next());
  var sheet = spreadsheet.getActiveSheet();
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  if (values.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "invalid",
      "message": "Belum ada data pendaftar"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var headers = values[0];
  var statusColIdx = headers.indexOf("Status Kehadiran");
  var timeColIdx = headers.indexOf("Waktu Check-in");
  
  // Jika kolom absensi belum ada, buat di ujung kanan
  if (statusColIdx === -1) {
    statusColIdx = headers.length;
    timeColIdx = headers.length + 1;
    sheet.getRange(1, statusColIdx + 1).setValue("Status Kehadiran").setBackground("#10b981").setFontColor("white").setFontWeight("bold");
    sheet.getRange(1, timeColIdx + 1).setValue("Waktu Check-in").setBackground("#10b981").setFontColor("white").setFontWeight("bold");
  }
  
  var ticketId = data.ticketId;
  
  // Cari baris yang memiliki Ticket ID yang sama
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === ticketId) { // Ticket ID diasumsikan ada di Kolom A (index 0)
      var nama = values[i][2]; // Nama Lengkap di Kolom C (index 2)
      var currentStatus = values[i][statusColIdx];
      
      if (currentStatus === "Hadir") {
        return ContentService.createTextOutput(JSON.stringify({
          "status": "already_scanned",
          "message": "Tiket sudah digunakan sebelumnya",
          "nama": nama
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        // Tandai sebagai Hadir
        sheet.getRange(i + 1, statusColIdx + 1).setValue("Hadir");
        sheet.getRange(i + 1, timeColIdx + 1).setValue(new Date());
        
        return ContentService.createTextOutput(JSON.stringify({
          "status": "success",
          "message": "Validasi Berhasil",
          "nama": nama
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
  }
  
  // Jika loop selesai tapi tiket tidak ditemukan
  return ContentService.createTextOutput(JSON.stringify({
    "status": "invalid",
    "message": "Tiket tidak terdaftar dalam sistem (Palsu)"
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleRegistration(data) {
  // 1. Simpan Gambar ke Google Drive
  var folderName = "Bukti Transfer Event";
  var folders = DriveApp.getFoldersByName(folderName);
  var folder;
  
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder(folderName);
  }
  
  var imageBlob = Utilities.newBlob(Utilities.base64Decode(data.fileContent), data.mimeType, data.fileName);
  var file = folder.createFile(imageBlob);
  var fileUrl = file.getUrl();
  
  // 2. Simpan Data ke Spreadsheet
  var sheetName = "Data Pendaftar Event";
  var files = DriveApp.getFilesByName(sheetName);
  var spreadsheet;
  var sheet;
  
  if (files.hasNext()) {
    spreadsheet = SpreadsheetApp.open(files.next());
    sheet = spreadsheet.getActiveSheet();
  } else {
    spreadsheet = SpreadsheetApp.create(sheetName);
    sheet = spreadsheet.getActiveSheet();
    
    // Buat Header Row
    var headers = ["Ticket ID", "Timestamp", "Nama Lengkap", "Email", "No Whatsapp", "Username TikTok", "Link TikTok", "Jumlah Followers", "URL Bukti Pembayaran", "Status Kehadiran", "Waktu Check-in", "Status Pembayaran"];
    sheet.appendRow(headers);
    
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#0ea5e9"); // Warna biru tema web
    headerRange.setFontColor("white");
    sheet.setFrozenRows(1);
  }
  
  var tickets = [];
  
  if (data.participants && Array.isArray(data.participants)) {
    for (var i = 0; i < data.participants.length; i++) {
      var p = data.participants[i];
      // Generate Ticket ID Unik
      var timestamp = Math.floor(Date.now() / 1000);
      var randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
      var ticketId = "TK-" + timestamp + "-" + randomStr;
      
      sheet.appendRow([
        ticketId,
        new Date(),
        p.fullName,
        p.email,
        p.whatsapp,
        p.tiktokUsername,
        p.tiktokLink,
        p.followers,
        fileUrl,
        "", // Status Kehadiran awal kosong
        "", // Waktu check-in awal kosong
        "Pending" // Status Pembayaran awal
      ]);
      
      tickets.push({
        ticketId: ticketId,
        email: p.email,
        fullName: p.fullName
      });
      
      // Kasih delay kecil agar timestamp dan random string lebih terjamin beda
      Utilities.sleep(50);
    }
  } else {
    // Fallback kalau format lama
    var timestamp = Math.floor(Date.now() / 1000);
    var randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    var ticketId = "TK-" + timestamp + "-" + randomStr;
    
    sheet.appendRow([
      ticketId,
      new Date(),
      data.fullName,
      data.email,
      data.whatsapp,
      data.tiktokUsername,
      data.tiktokLink,
      data.followers,
      fileUrl,
      "", 
      "",
      "Pending"
    ]);
    
    tickets.push({
      ticketId: ticketId,
      email: data.email,
      fullName: data.fullName
    });
  }
  
  sheet.autoResizeColumns(1, 11);
  
  // Kembalikan response JSON sukses
  return ContentService.createTextOutput(JSON.stringify({
    "status": "success",
    "message": "Data dan file berhasil disimpan",
    "fileUrl": fileUrl,
    "tickets": tickets
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleGetParticipants() {
  var sheetName = "Data Pendaftar Event";
  var files = DriveApp.getFilesByName(sheetName);
  
  if (!files.hasNext()) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": "Database Spreadsheet belum dibuat"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var spreadsheet = SpreadsheetApp.open(files.next());
  var sheet = spreadsheet.getActiveSheet();
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  if (values.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "success",
      "participants": []
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var headers = values[0];
  var statusColIdx = headers.indexOf("Status Kehadiran");
  
  var participants = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    participants.push({
      id: row[0] || "",
      nama: row[2] || "",
      email: row[3] || "",
      status: statusColIdx !== -1 ? (row[statusColIdx] || "") : ""
    });
  }
  
  // Balik urutan agar pendaftar terbaru berada di atas
  participants.reverse();
  
  return ContentService.createTextOutput(JSON.stringify({
    "status": "success",
    "participants": participants
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleGetAdminData() {
  var sheetName = "Data Pendaftar Event";
  var files = DriveApp.getFilesByName(sheetName);
  
  if (!files.hasNext()) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": "Database Spreadsheet belum dibuat"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var spreadsheet = SpreadsheetApp.open(files.next());
  var sheet = spreadsheet.getActiveSheet();
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  if (values.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "success",
      "participants": []
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var headers = values[0];
  var paymentStatusColIdx = headers.indexOf("Status Pembayaran");
  var buktiUrlColIdx = headers.indexOf("URL Bukti Pembayaran");
  var attendanceColIdx = headers.indexOf("Status Kehadiran");
  
  // Jika kolom Status Pembayaran belum ada, buat
  if (paymentStatusColIdx === -1) {
    paymentStatusColIdx = headers.length;
    sheet.getRange(1, paymentStatusColIdx + 1).setValue("Status Pembayaran").setBackground("#f59e0b").setFontColor("white").setFontWeight("bold");
  }
  
  var participants = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    participants.push({
      ticketId: row[0] || "",
      timestamp: row[1] ? new Date(row[1]).toISOString() : "",
      fullName: row[2] || "",
      email: row[3] || "",
      whatsapp: row[4] || "",
      buktiUrl: buktiUrlColIdx !== -1 ? (row[buktiUrlColIdx] || "") : "",
      statusPembayaran: paymentStatusColIdx !== -1 ? (row[paymentStatusColIdx] || "Pending") : "Pending",
      statusKehadiran: attendanceColIdx !== -1 ? (row[attendanceColIdx] || "") : ""
    });
  }
  
  participants.reverse();
  
  return ContentService.createTextOutput(JSON.stringify({
    "status": "success",
    "participants": participants
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleUpdatePaymentStatus(data) {
  var sheetName = "Data Pendaftar Event";
  var files = DriveApp.getFilesByName(sheetName);
  
  if (!files.hasNext()) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": "Database Spreadsheet belum dibuat"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var spreadsheet = SpreadsheetApp.open(files.next());
  var sheet = spreadsheet.getActiveSheet();
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  if (values.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": "Belum ada data"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var headers = values[0];
  var paymentStatusColIdx = headers.indexOf("Status Pembayaran");
  
  if (paymentStatusColIdx === -1) {
    paymentStatusColIdx = headers.length;
    sheet.getRange(1, paymentStatusColIdx + 1).setValue("Status Pembayaran").setBackground("#f59e0b").setFontColor("white").setFontWeight("bold");
  }
  
  var ticketId = data.ticketId;
  
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === ticketId) {
      sheet.getRange(i + 1, paymentStatusColIdx + 1).setValue("Lunas");
      
      return ContentService.createTextOutput(JSON.stringify({
        "status": "success",
        "message": "Status pembayaran berhasil diupdate"
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    "status": "error",
    "message": "Ticket ID tidak ditemukan"
  })).setMimeType(ContentService.MimeType.JSON);
}
