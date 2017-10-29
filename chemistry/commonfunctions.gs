//Gets all of the data in a specific sheet and returns an array
function getDataValues(name) {
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var data = sa.getSheetByName(name).getDataRange().getValues();
  return data;
}

//Defines the custom menu items
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Regenerate Students')
    .addItem('Get New Students', 'compareandadd')
    .addToUi();
}

//Refreshes the JSON sheet (to be called from a trigger)
function refreshSheets() {
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = [];
  sheets.push(sa.getSheetByName("From Slate"));
  sheets.push(sa.getSheetByName("Withdrawals"));
  
  for(var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var formula = sheet.getRange(1, 1).getFormula();
    sheet.clear();
    sheet.getRange(1, 1).setFormula(formula);
  }
}