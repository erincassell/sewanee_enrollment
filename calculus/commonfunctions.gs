//Gets and returns an array of all of the data in the sheet passed into the function
function getDataValues(name) {
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var data = sa.getSheetByName(name).getDataRange().getValues();
  return data;
}

//Build and defines the custom menu
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Regenerate Students')
    .addItem('Get New Students', 'addandupdate')
    .addToUi();
}

//Refreshes the JSON calls on specific sheets.
function refreshSheets() {
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var slate = sa.getSheetByName("From Slate");
  var withdraw = sa.getSheetByName("Withdrawals");
  var formula = slate.getRange(1, 1).getFormula();
  slate.clear();
  slate.getRange(1, 1).setFormula(formula);
  
  formula = withdraw.getRange(1, 1).getFormula();
  withdraw.clear();
  withdraw.getRange(1, 1).setFormula(formula);
}