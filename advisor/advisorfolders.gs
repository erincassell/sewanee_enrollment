//The checks the Folder Done and Files columns of the Student table
//It will mark if the Folder has been created and count the number of files in a student folder
function checkAdviseeFolders() {
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var studentSS = sa.getSheetByName("Students");
  var studentDT = getDataValues(studentSS.getName());
  var curFolder = DriveApp.getFileById(sa.getId()).getParents().next();
  var workFolder = curFolder.getFoldersByName("*Working Items").next();
  var workingFolders = workFolder.getFolders();
  var working = [];
  
  //Put all of the working folders in a hash
  while(workingFolders.hasNext()) {
    var workingFolder = workingFolders.next();
    working[workingFolder.getName()] = workingFolder;
  }
  
  //Build the header hash
  var studentHead = studentDT[0];
  var studHeaders = buildHash(studentHead);

  //Clear the Folder Done Row
  studentSS.getRange(2, studHeaders["Folder Done"]+1, studentDT.length, 1).clear();
  
  //Get all of the students in one array
  var students = [];
  for(var s = 0; s < studentDT.length; s++) {
    students.push(studentDT[s][0]);
  }
  
  //Get the Advisees Folder and the folders within
  var advisees = working["Advisees"];
  var studentfolders = advisees.getFolders();
  
  //Go through all of the folders and mark if it exists
  while(studentfolders.hasNext()) {
    var studentfolder = studentfolders.next();
    
    //Get and check the name of the folder
    var foldername = studentfolder.getName();
    var hyphen = foldername.indexOf(" -");
    foldername = foldername.substr(0, hyphen);
    var index = students.indexOf(foldername);
    var mark = "";
    if(index > 0) {
      mark = "X";
    }
    studentDT[index][studHeaders["Folder Done"]] = mark;
    
    //Get how many files are in the student folder
    var files = studentfolder.getFiles();
    var cnt = 0;
    var help = 2;
    while(files.hasNext()) {
      cnt++;
      files.next();
    }
    studentDT[index][studHeaders["Files"]] = cnt;
  }
  
  //Go through the sheet and put the last column
  var putDT = [];
  for(i = 0; i < studentDT.length; i++) {
    putDT.push([studentDT[i][studHeaders["Folder Done"]], studentDT[i][studHeaders["Files"]]]); //Build the array to write back to the sheet
  }
  studentSS.getRange(1, studHeaders["Folder Done"]+1, putDT.length, putDT[0].length).setValues(putDT); //Put the student sheet
}

//Builds new advisee folders for those that are not created
function adviseeFolders() {
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var studentSS = sa.getSheetByName("Students");
  var studentDT = getDataValues(studentSS.getName());
  var curFolder = DriveApp.getFileById(sa.getId()).getParents().next();
  var workFolder = curFolder.getFoldersByName("*Working Items").next();
  var workingFolders = workFolder.getFolders();
  var working = [];
  
  //Put all of the working folders in a hash
  while(workingFolders.hasNext()) {
    var workingFolder = workingFolders.next();
    working[workingFolder.getName()] = workingFolder;
  }
  
  //Build the header hash
  var studentHead = studentDT[0];
  var studHeaders = buildHash(studentHead);
  
  var advisees = working["Advisees"]; //Get the advisee folder
  
  //Process through the students
  for(var i = 1; i < studentDT.length; i++) {
    var foldername = studentDT[i][studHeaders["Name"]] + " - " + studentDT[i][studHeaders["BannerID"]]; //Build the folder name
    if(studentDT[i][studHeaders["Folder Done"]] == "" && studentDT[i][studHeaders["Withdrawal"]] == "No") {
      advisees.createFolder(foldername); //Create the folder
      studentDT[i][studHeaders["Folder Done"]] = "X"; //Mark Done in the Folder Done column
    } else if(studentDT[i][studHeaders["Folder Done"]] == "X" && studentDT[i][studHeaders["Withdrawal"]] == "Yes") {
      //Find the folder
      var studFolders = advisees.getFoldersByName(foldername); //Get all of the student folders with that folder name
      var studFolder = studFolders.next(); //Get the first folder
      studFolder.setTrashed(true); //Remove the folder
      studentDT[i][studHeaders["Folder Done"]] = "Removed" //Update Folder Done to Removed
    }
  }
}

//Create the advisor folder from the list provided
function advisorFolders() {
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var advisorSS = sa.getSheetByName("Advisors");
  var advisorDT = getDataValues(advisorSS.getName());
  var curFolder = DriveApp.getFileById(sa.getId()).getParents().next();
  
  //Build the header hash
  var advisorHead = advisorDT[0];
  var advisorHeaders = buildHash(advisorHead);
  
  //Prepare the date and build the folder front string
  var today = new Date();
  var year = today.getFullYear().toString();
  year = year.substr(year.length - 2);
  
  //Process through the advisor sheet and build the folders
  for(var i = 1; i < advisorDT.length; i ++) {
    var foldername = "Fall " + year + " Incoming Advising - ";
    if(advisorDT[i][advisorHeaders["Folder Done"]] == "") {
      foldername = foldername + advisorDT[i][advisorHeaders["Name"]]; //Final folder name
      curFolder.createFolder(foldername); //Build the folder
      advisorDT[i][advisorHeaders["Folder Done"]] = "X"; //Mark the folder complete
    }
  }
  //Go through the sheet and put the last column
  var putDT = [];
  for(i = 0; i < advisorDT.length; i++) {
    putDT.push([advisorDT[i][advisorHeaders["Folder Done"]]]); //Build the array to write back to the sheet
  }
  
  advisorSS.getRange(1, advisorHead.length, putDT.length, putDT[0].length).setValues(putDT); //Put on the advisor sheet
}

//Process through the unfile exports and put in the correct student folders
function processExports() {
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var docSS = sa.getSheetByName("Documents");
  var docDT = getDataValues(docSS.getName());
  var studentSS = sa.getSheetByName("Students");
  var studentDT = getDataValues(studentSS.getName());
  var curFolder = DriveApp.getFileById(sa.getId()).getParents().next();
  var workingFolders = curFolder.getFoldersByName("*Working Items").next().getFolders();
  var working = [];
  
  //Get the header hash
  var docHead = buildHash(docDT[0]);
  var studHead = buildHash(studentDT[0]);
  
  var docHash = [];
  for(var j = 1; j < docDT.length; j++){
    docHash[docDT[j][0]] = docDT[j][1];
  }
  
  //Put all of the working folders in a hash
  while(workingFolders.hasNext()) {
    var workingFolder = workingFolders.next();
    working[workingFolder.getName()] = workingFolder;
  }
  
  var advisees = working["Advisees"];
  
  for(var key in working) {
    var folder = working[key];
    var foldername = folder.getName();
    if(foldername == "FYP Essays" || foldername == "Summer Reading" || foldername == "Supplemental Info" || foldername == "Transcript(s)") {
      var files = folder.getFiles();
      while(files.hasNext()) {
        var file = files.next();
        var filename = file.getName();
        var paren = filename.indexOf(" (");
        filename = filename.substr(0, paren);
        var search = "title contains \"" + filename + "\"";
        var advisee = advisees.searchFolders(search).next();
        file = renameFile(file, docHash[foldername]);
        var help = 1;
        advisee.addFile(file);
        folder.removeFile(file);

      }
    }
    var help = 1;
  }
}

//Move the advisee folders to the correct advisor folders
function moveAdvisees() {
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var studentSS = sa.getSheetByName("Students with Advisors");
  var studentDT = getDataValues(studentSS.getName());
  var curFolder = DriveApp.getFileById(sa.getId()).getParents().next();
  var workFolder = curFolder.getFoldersByName("*Working Items").next();
  var workingFolders = workFolder.getFolders();
  var working = [];
  
  //Get all of the Advisor Folders
  var advisorFolders = curFolder.getFolders();
  
  //Put into a hash folder of all advisor folders
  var advisors = [];
  while(advisorFolders.hasNext()) {
    var advisorFolder = advisorFolders.next();
    advisors[advisorFolder.getName().trim()] = advisorFolder;
  }
  
  //Get all of the student folders
  var advisees = workFolder.getFoldersByName("Advisees").next()
  var studentFolders = advisees.getFolders();
  
  //Build an aray of the student names from the Student and Advisor list
  var students = [];
  for(var i = 0; i < studentDT.length; i++) {
    students.push(studentDT[i][1].trim());
  }
  
  //Loop through the student folders
  while(studentFolders.hasNext()) {
    var studentFolder = studentFolders.next();
    var filename = studentFolder.getName(); //Get the name of the student folder
    var hyphen = filename.indexOf(" -");
    filename = filename.substr(0, hyphen).trim(); //Get the file name up to the hyphen
    var index = students.indexOf(filename); //Find the student in the student data
    var advisor = studentDT[index][7].trim(); //Get the advisor from the student data
    var advisorFolder = "title contains \"Fall 17 Incoming Advising - " + advisor + "\"";
    var toFolder = curFolder.searchFolders(advisorFolder); //Put the advisor into the has to get the folder
    toFolder.next().addFolder(studentFolder); //Move student folder to the advisor folder
    advisees.removeFolder(studentFolder); //Remove the student folder from the Advisee folder
    Logger.log("Student folder: " + filename + " moved.");
    var help = 1;
  }
}

//Last step in the process - adds the faculty member which makes the notification
function makeFacultyNotifications() {
  //Get the advisors from the Advisor sheet
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var advisors = sa.getSheetByName("Advisors");
  var advisorsDT = getDataValues(advisors.getName());
  var curFolder = DriveApp.getFileById(sa.getId()).getParents().next();
  
  //Get the Advisor headers
  var advisorHead = buildHash(advisorsDT[0]);
  
  //Make an array of just the advisornames
  var advisorNames = [];
  for(var i = 0; i < advisorsDT.length; i++) {
    advisorNames.push(advisorsDT[i][0]);
  }
  
  //Get all of the faculty folders
  var facultys = curFolder.getFolders();
  while(facultys.hasNext()) { //While there are still folders, process through
    var faculty = facultys.next(); //Get the next folder individually
    var foldername = faculty.getName(); //Get the folder name
    if(foldername.substr(0, 3) == "Fal") { //If it is a faculty folder
      var hyphen = foldername.indexOf("-"); //Find the location of the hyphen
      foldername = foldername.substring(hyphen+1, foldername.length).trim(); //Strip the front of the folder name leaving only the faculty member's name
      var index = advisorNames.indexOf(foldername); //Find which row has this faculty member
      var email = advisorsDT[index][advisorHead["Email Address"]]; //Get the email address for the faculty member
      faculty.addEditor(email); //Add the faculty member as an editor to the folder
    }
  }
}

//Builds a hash from an array provided
function buildHash(head) {
  var hashArray = [];
  for(var i = 0; i < head.length; i++) {
    hashArray[head[i]] = i;
  }
  return hashArray;
}

//Renames a file based on the parent folder and the file
function renameFile(file, parent) {
  file.setName(parent + " " + file.getName());
  var help = file.getName();
  return file;
}
