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
 * 9. Selesai! (Tidak perlu mengubah URL di kode Next.js Anda karena URL-nya tetap sama).
 */

function doPost(e) {
  try {
    // Parsing data JSON yang dikirim dari form HTML
    var data = JSON.parse(e.postData.contents);
    
    // 1. Simpan Gambar ke Google Drive
    // Buat folder bernama "Bukti Transfer Event" jika belum ada
    var folderName = "Bukti Transfer Event";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder;
    
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
    }
    
    // Decode base64 dan simpan file
    var imageBlob = Utilities.newBlob(Utilities.base64Decode(data.fileContent), data.mimeType, data.fileName);
    var file = folder.createFile(imageBlob);
    var fileUrl = file.getUrl();
    
    // 2. (Opsional) Simpan Data ke Spreadsheet Baru
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
      var headers = ["Ticket ID", "Timestamp", "Nama Lengkap", "Email", "No Whatsapp", "Username TikTok", "Link TikTok", "Jumlah Followers", "URL Bukti Pembayaran"];
      sheet.appendRow(headers);
      
      // --- FORMATTING HEADER AGAR RAPI ---
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0ea5e9"); // Warna biru tema web
      headerRange.setFontColor("white");
      
      // Freeze (kunci) baris pertama agar header selalu terlihat saat di-scroll ke bawah
      sheet.setFrozenRows(1);
    }
    
    // Generate Ticket ID Unik (contoh: TK-172085-ABCD)
    var timestamp = Math.floor(Date.now() / 1000);
    var randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    var ticketId = "TK-" + timestamp + "-" + randomStr;

    // Tambahkan data pendaftar ke baris baru
    sheet.appendRow([
      ticketId,
      new Date(),
      data.fullName,
      data.email,
      data.whatsapp,
      data.tiktokUsername,
      data.tiktokLink,
      data.followers,
      fileUrl
    ]);
    
    // Auto-resize semua kolom agar lebar sel menyesuaikan isi teks secara otomatis
    sheet.autoResizeColumns(1, 9);
    
    // Kembalikan response JSON sukses
    return ContentService.createTextOutput(JSON.stringify({
      "status": "success",
      "message": "Data dan file berhasil disimpan",
      "fileUrl": fileUrl,
      "ticketId": ticketId
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Tangani error
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
