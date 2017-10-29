function getDataValues(name) {
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var data = sa.getSheetByName(name).getDataRange().getValues();
  return data;
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Advising')
    .addItem('Notify Faculty', 'makeFacultyNotifications')
    .addSeparator()
    .addSubMenu(ui.createMenu('Prep Items')
      .addItem('Build Working Folders', 'buildWorkingFolders')
      .addItem('Build Advisee Folders', 'adviseeFolders')
      .addItem('Build Advisor Folders', 'advisorFolders')
      .addItem('Move Advisee Folders', 'moveAdvisees')
      .addItem('Cleanup Students', 'cleanupStudents')
      .addItem('Process Exports', 'processExports'))
    .addToUi();
}

function checkDefined(x) {
  if(typeof(x) == 'undefined') {
    return("");
  } else {
    return x;
  }
}