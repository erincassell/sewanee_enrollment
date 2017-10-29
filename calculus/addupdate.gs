//Adds new students from the From Slate sheet to the Calc Placements sheet
function addandupdate() {
  //Get the spreadsheets and data from the spreadsheets
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var slateSS = sa.getSheetByName("From Slate");
  var studentSS = sa.getSheetByName("Calc Placements");
  var slateDT = getDataValues(slateSS.getName());
  var studentDT = getDataValues(studentSS.getName());
  var additions = [];
  
  studentSS.clearFormats(); //Clears all formatting on the Calc Placement sheet
  
  //Loop through all of the data coming from Slate
  for(var i = 1; i < slateDT.length; i ++) {
    var bannerid = slateDT[i][0];
    var match = "No Match";
    var j = 1;
    
    //Loop through all of the student data unless there is a match
    while(j < studentDT.length && match == "No Match") {
      var matchID = studentDT[j][1].trim();

      if(bannerid.trim() != matchID){ //If the BannerIDs don't match, move on
        j++;
      } else {
        match = "Match"; //If the BannerIDs do match, stop the loop
      }
    }
    
    if(match == "No Match"){ //If there was no match, add it to the additions array without the last three columns
      additions.push(moveColumns(slateDT[i]));
    }
  }
  
  if(additions.length > 0) { //If there are additions
    //Paste these into the bottom of the first page starting in column 2
    studentSS.getRange(studentDT.length + 1, 2, additions.length, additions[0].length).setValues(additions);
  
    //Sort the entire sheet by name including the first row.
    studentDT = getDataValues(studentSS.getName());
    var sortRng = studentSS.getRange(2, 1, studentDT.length, studentDT[0].length);
    sortRng.sort(5);
  }
  markWithdrawals(); //Mark the withdrawals
  updateGrades(); //
}


//This functions goes through the students on Calc Placements and marks the ones who are withdrawn
function markWithdrawals() {
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var slateSS = sa.getSheetByName("Withdrawals");
  var studentSS = sa.getSheetByName("Calc Placements");
  var slateDT = getDataValues(slateSS.getName());
  var studentDT = getDataValues(studentSS.getName());
  
  //Loop through all of the data coming from Slate
  for(var i = 1; i < slateDT.length; i ++) {
    var bannerid = slateDT[i][0];
    var match = "No Match";
    var j = 1;
    
    //Loop through all of the student data unless there is a match
    while(j < studentDT.length && match == "No Match") {
      var matchID = studentDT[j][1].trim();

      if(bannerid.trim() != matchID){ //If the BannerIDs don't match, move on
        j++;
      } else {
        studentSS.getRange(j+1, 1, 1, studentDT[0].length).setFontLine("line-through");
        match = "Match"; //If the BannerIDs do match, stop the loop
      }
    }
  }
  
}


//Moves columns from one place to another for a specific to put it in the order the faculty member wants it
function moveColumns(studentRow) {
  studentRow.splice(10, 3);

  var v = checkDefined(studentRow.splice(10, 1));
  studentRow.splice(5, 0, v.join());
  
  v = checkDefined(studentRow.splice(12, 1));
  studentRow.splice(6, 0, v.join());
  
  return studentRow;
}

//Requirement: If a student's final grade has updated in Slate, the faculty member wants the new grade and the date that it was updated
//This is reflected in columns D and E
function updateGrades() {
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var slateSS = sa.getSheetByName("From Slate");
  var studentSS = sa.getSheetByName("Calc Placements");
  var slateDT = getDataValues(slateSS.getName());
  var studentDT = getDataValues(studentSS.getName());
  
  //Loop through all of the data coming from Slate
  for(var i = 1; i < slateDT.length; i ++) {
    var compare = slateDT[i][0];
    
    var calcGrade = slateDT[i][2];
    var match = "No Match";
    var j = 1;
    
    //Loop through all of the student data unless there is a match
    while(j < studentDT.length && match == "No Match") {
      var matchID = studentDT[j][1];
      var matchGrade = studentDT[j][3].trim();
      
      var help = 1;

      if(compare == matchID && calcGrade.trim() == matchGrade){ //If the Calc Grade matches move on
        match = "Match";
      } else if (compare == matchID && calcGrade.trim() != matchGrade) { //Update the grade and set today's date
        studentSS.getRange(j+1, 4).setValue(calcGrade);
        studentSS.getRange(j+1, 5).setValue(new Date());
        match = "Match"; 
      } else { //Move on
        j++;
      }
    }
  }
}

//Checks to see if the value passed in is defined
function checkDefined(x) {
  if(typeof(x) == 'undefined') {
    return(" ");
  } else {
    return x;
  }
}