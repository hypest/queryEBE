//
// Utility to launch a barcode reader from inside Google Sheets, to scan the ISBN of a book and append it to the first column as a new row.
//

// Credit: https://stackoverflow.com/a/73126741

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Scan')
      .addItem('Scan ISBN codes', 'showQRDialog')
      .addToUi();
}

function showQRDialog() {
  var html = HtmlService.createHtmlOutputFromFile('scanner')
      .setWidth(600)
      .setHeight(480);
  SpreadsheetApp.getUi().showModalDialog(html, 'Scan ISBN codes');
}

function getQRCode(txt){
  let sheet = SpreadsheetApp.getActiveSheet()
  sheet.getRange(sheet.getLastRow()+1,1).setValue(txt);

  // repeat until dialog is manually closed
  showQRDialog();
}
