//Moves new registrants to Registration List sheet
function putRegistrations() {
  //Get the spreadsheets and data from the spreadsheets
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var slateSS = sa.getSheetByName("Form Data");
  var putSS = sa.getSheetByName("Registration List");
  var slateDT = getDataValues(slateSS.getName());
  var putDT = getDataValues(putSS.getName());
  var additions = [];
  
  //Loop through all of the data coming from Slate
  for(var i = 1; i < slateDT.length; i ++) {
    var bannerid = slateDT[i][0];
    var match = "No Match";
    var j = 1;
    
    //Loop through all of the grading data unless there is a match
    while(j < putDT.length && match == "No Match") {
      var matchID = putDT[j][0].trim();

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
    putSS.getRange(putDT.length + 1, 1, additions.length, additions[0].length).setValues(additions);
  
    //Sort the entire sheet by name including the first row.
    putDT = getDataValues(putSS.getName());
    var sortRng = putSS.getRange(2, 1, putDT.length, putDT[0].length);
    sortRng.sort(2);
  }
  
  updatePayment();
}

//Moves and removeds any columns, so it is in the right order
function moveColumns(studentRow) {
  var helper = 1;
  
  //Determine payment status and put it in the correct field
  if(studentRow[2] != ""){
    studentRow[2] = "FA Request";
  } else {
    studentRow[2] = studentRow[3];
  }
  studentRow.splice(3, 1);
  helper = 1;
  
  //Create the hometown column and put it in the correct field
  studentRow[11] = studentRow[11] + ", " + studentRow[12];
  studentRow.splice(12, 1);
  helper = 1;
  
  //Move the unable activities in front of the able activities
  var v = checkDefined(studentRow.splice(35, 1));
  studentRow.splice(13, 0, v[0]);
  
  //Remove the CEEB Code
  studentRow.splice(12, 1);
  studentRow.splice(14, 17);
  studentRow.splice(15, 10);
  helper = 1;
  
  return studentRow;
}

//Updates the payment column on the registration page
function updatePayment() {
  //Get the spreadsheets and data from the spreadsheets
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var slateSS = sa.getSheetByName("Form Data");
  var putSS = sa.getSheetByName("Registration List");
  var slateDT = getDataValues(slateSS.getName());
  var putDT = getDataValues(putSS.getName());
  var additions = [];
  
  //Find the column that is used for payment
  var payCol = slateDT[0].indexOf("Paymentmostrecentstatus", 0);
  var payCol2 = putDT[0].indexOf("Payment", 0);

  var updates = [];
  var i = 1; //start with row 1
  
  //Loop through the rows in the registration sheet
  while(i < putDT.length) {
    if(putDT[i][payCol2] == "Payment Received") { //If the student is marked as payment received
      var payment = [putDT[i][payCol2]];
      updates.push(payment); //push it to the updates array
      i++;
    } else {
      var j = 1;
      var bannerid = putDT[i][0].trim();
      while(j < slateDT.length) { //Go through the Slate data until you find the matching BannerID
        var slateID = slateDT[j][0].trim();
        if(bannerid == slateID) { //If they match
          if(putDT[i][payCol2] != slateDT[j][payCol]) { //Check to see if the payment statuses are the same
            //If they don't match, put the value from the Slate data into the array
            payment = [slateDT[j][payCol]];
            updates.push(payment);
          } else {
            //otherwise put the value current value on the array
            payment = [putDT[i][payCol2]];
            updates.push(payment);
          }
          i++; //increment to the next row
          j = slateDT.length + 10; //Found a match, so exit the loop
        } else { //if the bannerids don't match, go to the next banner id
          j++; //No match, so check the next row
        }
      }
   }
  }
  //Put the payment values in the registration table
  putSS.getRange(2, payCol2+1, updates.length, 1).setValues(updates);
}