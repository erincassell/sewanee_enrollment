function addStudents() {
  //Get the spreadsheets and data from the spreadsheets
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var slateSS = sa.getSheetByName("From Slate");
  var studentSS = sa.getSheetByName("Complete list");
  var slateDT = getDataValues(slateSS.getName());
  var studentDT = getDataValues(studentSS.getName());
  var additions = [];
  
  studentSS.clearFormats();
  
  //Loop through all of the data coming from Slate
  for(var i = 1; i < slateDT.length; i ++) {
    var bannerid = slateDT[i][0];
    var match = "No Match";
    var j = 1;
    
    var loopLength = j;
    while(studentDT[j][0] != "") {
      j++;
      loopLength = j;
    }
    
    loopLength++;
    var help = 1;
    
    j = 1;
    //Loop through all of the student data unless there is a match
    while(j < loopLength && match == "No Match") {
      var matchID = studentDT[j][0].trim();

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
  
  if(additions.length > 0) {
    //Paste these into the bottom of the first page starting in column 2
    studentSS.getRange(loopLength, 1, additions.length, additions[0].length).setValues(additions);
  
    //Sort the entire sheet by name including the first row.
    studentDT = getDataValues(studentSS.getName());
    var sortRng = studentSS.getRange(2, 1, studentDT.length, studentDT[0].length);
    sortRng.sort([4, 2]);
  }
  markWithdrawals();
}

function moveColumns(studentRow) {
  studentRow.splice(6, 4);
  return studentRow;
}

function markWithdrawals() {
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var slateSS = sa.getSheetByName("Withdrawals");
  var studentSS = sa.getSheetByName("Complete List");
  var slateDT = getDataValues(slateSS.getName());
  var studentDT = getDataValues(studentSS.getName());
  
  //Loop through all of the data coming from Slate
  for(var i = 1; i < slateDT.length; i ++) {
    var bannerid = slateDT[i][0];
    var match = "No Match";
    var j = 1;
    
    //Loop through all of the student data unless there is a match
    while(j < studentDT.length && match == "No Match") {
      var matchID = studentDT[j][0].trim();

      if(bannerid.trim() != matchID){ //If the BannerIDs don't match, move on
        j++;
      } else {
        studentSS.getRange(j+1, 1, 1, studentDT[0].length).setFontLine("line-through");
        match = "Match"; //If the BannerIDs do match, stop the loop
      }
    }
  }
  
}

function checkDefined(x) {
  if(typeof(x) == 'undefined') {
    return(" ");
  } else {
    return x;
  }
}