//Builds the working folders
function buildWorkingFolders() {
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var docSS = sa.getSheetByName("Documents");
  var docDT = getDataValues(docSS.getSheetName());
  var file = DriveApp.getFileById(sa.getId());
  var curFolder = file.getParents().next();
  
  //Prompt the user
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert("Confirm Documents", "Have you populated all possible documents in the Documents tab?", ui.ButtonSet.YES_NO);
  if(response == ui.Button.NO) {
    ui.alert("Run again when you are ready.");
  } else {
    docDT.push(["Advisees"], ["Merging Folder"], ["Withdrawn"]); //Add the additional folders needed
    
    //Create the working folder inside the current folder
    var working = curFolder.createFolder("*Working Items");
    for(var i = 0; i < docDT.length; i++) {
      var folder = docDT[i];
      var help = 2;
      working.createFolder(folder[0]);
    }
  }
}
