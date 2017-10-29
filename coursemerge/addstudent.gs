function addStudents() {
  //Get the spreadsheets and data from the spreadsheets
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var slateSS = sa.getSheetByName("From Slate");
  var studentSS = sa.getSheetByName("Students to Merge");
  var slateDT = getDataValues(slateSS.getName());
  var studentDT = getDataValues(studentSS.getName());
  var additions = [];
  var rows;
  
  var i = 0;
  while(i < studentDT.length) {
    if(studentDT[i][1] == "") {
      rows = i;
      i = 1000;
    }
    i++
  }
  
  //Loop through all of the data coming from Slate
  for(i = 1; i < slateDT.length; i ++) {
    var bannerid = slateDT[i][1];
    var match = "No Match";
    var j = 1;
    
    //Loop through all of the data unless there is a match
    while(j < studentDT.length && match == "No Match") {
      var matchID = studentDT[j][2].trim();

      if(bannerid.trim() != matchID){ //If the BannerIDs don't match, move on
        j++;
      } else {
        match = "Match"; //If the BannerIDs do match, stop the loop
      }
    }
    
    if(match == "No Match"){ //If there was no match, add it to the additions array without the last three columns
      additions.push(slateDT[i].splice(0,5));
    }
  }
  
  var help = 1;
  
  if(additions.length > 0) {
    //Paste these into the bottom of the first page starting in column 2
    studentSS.getRange(rows+1, 2, additions.length, additions[0].length).setValues(additions);
  }
  
  //markWithdrawals();
}

function addTransfers() {
  //Get the spreadsheets and data from the spreadsheets
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var slateSS = sa.getSheetByName("From Slate TFR");
  var studentSS = sa.getSheetByName("Students to Merge TFR");
  var slateDT = getDataValues(slateSS.getName());
  var studentDT = getDataValues(studentSS.getName());
  var additions = [];
  var rows = 0;
  
  var i = 0;
  while(i < studentDT.length) {
    if(studentDT[i][0] == "") {
      rows = i;
      i = 1000;
    }
    i++;
  }
  
  //Loop through all of the data coming from Slate
  for(i = 1; i < slateDT.length; i ++) {
    var bannerid = slateDT[i][1];
    var match = "No Match";
    var j = 1;
    
    //Loop through all of the data unless there is a match
    while(j < studentDT.length && match == "No Match") {
      var matchID = studentDT[j][1].trim();

      if(bannerid.trim() != matchID){ //If the BannerIDs don't match, move on
        j++;
      } else {
        match = "Match"; //If the BannerIDs do match, stop the loop
      }
    }
    
    if(match == "No Match"){ //If there was no match, add it to the additions array without the last three columns
      additions.push(slateDT[i].splice(0,23));
    }
  }
  
  if(additions.length > 0) {
    //Paste these into the bottom of the first page starting in column 2
    studentSS.getRange(rows+1, 1, additions.length, additions[0].length).setValues(additions);
  }
}

function checkDefined(x) {
  if(typeof(x) == 'undefined') {
    return("");
  } else {
    return x;
  }
}