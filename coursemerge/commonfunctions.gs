function getDataValues(name) {
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var data = sa.getSheetByName(name).getDataRange().getValues();
  return data;
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Course Merge')
    .addItem('Get New Students', 'addStudents')
    .addItem('Get New Transfers', 'addTransfers')
    .addItem('Process Students', 'processStudents')
    .addItem('Check Courses', 'courseCheck')
    .addToUi();
}

function refreshSheets() {
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = [];
  sheets.push(sa.getSheetByName("From Slate"));
  sheets.push(sa.getSheetByName("From Slate TFR"));
  sheets.push(sa.getSheetByName("Athletes"));
  sheets.push(sa.getSheetByName("Withdrawals"));
  sheets.push(sa.getSheetByName("Cohort"));
  //sheets.push(sa.getSheetByName("FYP"));
  
  for(var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var formula = sheet.getRange(1, 1).getFormula();
    sheet.clear();
    sheet.getRange(1, 1).setFormula(formula);
  }
}