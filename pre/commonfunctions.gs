function getDataValues(name) {
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var data = sa.getSheetByName(name).getDataRange().getValues();
  return data;
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('PRE Items')
    .addItem('Update Master', 'addtomaster')
    .addItem('Build PRE Families', 'matchStudents')
    .addToUi();
}

function checkDefined(x) {
  if(typeof(x) == 'undefined') {
    return("");
  } else {
    return x;
  }
}