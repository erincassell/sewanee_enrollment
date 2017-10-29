function addtomaster() {
  //Get the spreadsheets and data from the spreadsheets
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var slateSS = sa.getSheetByName("From Slate");
  var putSS = sa.getSheetByName("Master List");
  var slateDT = getDataValues(slateSS.getName());
  var putDT = getDataValues(putSS.getName());
  var additions = [];
  var ids = [];
  
  //Transpose the bannerids from the master list
  for(var j = 1; j < putDT.length; j++) {
    ids.push(putDT[j][1].trim());
  }
  var allids = ids.join(","); 
  var slateHead = slateDT[0];
  var help = 1;

  //Loop through all of the data coming from Slate
  for(var i = 1; i < slateDT.length; i++) {
    var bannerid = slateDT[i][0].trim();
    //If the bannerid is not in the id list, add it
    if(ids.indexOf(bannerid) == -1) {
      additions.push(prepRow(slateDT[i], slateHead));
      help = 3;
    }
  }
  
  var help = 2;
  
  if(additions.length > 0) {
    putSS.getRange(putDT.length + 1, 2, additions.length, additions[0].length).setValues(additions);
  }
  
  putSS.getRange(2, 1, putSS.getDataRange().getLastRow()-1, putSS.getDataRange().getLastColumn()).sort(3);

  //Update other data
  updtData();
}

function prepRow(studentRow, headers) {

  var fa = headers.indexOf("FA");
  var payment = headers.indexOf("Payment");
  var city = headers.indexOf("City");
  var state = headers.indexOf("State");
  var count = headers.indexOf("Count");
  var withdrawal = headers.indexOf("Withdrawal Date");
  
  //Determine payment status and put it in the correct field
  if(studentRow[fa] == "FA Request" && studentRow[payment] == "Payment Due"){
    studentRow[fa] = "FA Request";
  } else {
    studentRow[fa] = studentRow[payment];
  }
  
  //Create the hometown column and put it in the correct field
  studentRow[city] = studentRow[city] + ", " + studentRow[state];
  
  //Add together the activities
  studentRow[count] = parseInt(studentRow[count-6]) + parseInt(studentRow[count-5]) + parseInt(studentRow[count-4]) + parseInt(studentRow[count-3]) + parseInt(studentRow[count-2]) + parseInt(studentRow[count-1]);
  
  for(var i = 0; i < studentRow.length; i++) {
    if(studentRow[i] == "X" || studentRow[i] == 0) {
      studentRow[i] = "";
    }
  }
  
  //Clear the Withdrawal Date
  var withDate = studentRow[withdrawal].toString();
  if(withDate == "Thu Jan 01 1970 00:00:00 GMT-0600 (CST)") {
    studentRow[withdrawal] = "";
  }
  
  var help = 7;
  studentRow.splice(payment, 1);
  studentRow.splice(state-1, 1);
  return studentRow;
}

function updtData() {
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var slateSS = sa.getSheetByName("From Slate");
  var putSS = sa.getSheetByName("Master List");
  var withSS = sa.getSheetByName("Withdrawals");
  var travelSS = sa.getSheetByName("Travel");
  var slateDT = getDataValues(slateSS.getName());
  var putDT = getDataValues(putSS.getName());
  var withDT = getDataValues(withSS.getName());
  var travelDT = getDataValues(travelSS.getName());
  var additions = [];
  var ids = [];
  
  //Find the column that is used for payment
  var payCol = slateDT[0].indexOf("Payment", 0);
  var payCol2 = putDT[0].indexOf("Payment", 0);

  var payments = [];
  var travel = [];
  var i = 1; //start with row 1
  var paymentIDs = returnString(slateDT, 0, 1);
  var travelIDs = returnString(travelDT, 0, 1);
  var withIDs = returnString(withDT, 0, 0);
  var putTravel = putDT[0].indexOf("Travel");
  var slateTravel = slateDT[0].indexOf("Travel");
  var putWith = putDT[0].indexOf("Withdrawal");
  var help = 1;
  
  //Loop through the rows in the master list sheet
  while(i < putDT.length && putDT[i][2] != "") {
    var putID = putDT[i][1];
    var slateRow = paymentIDs.indexOf(putID);
    var travelRow = travelIDs.indexOf(putID);
    var withRow = withIDs.indexOf(putID);
    var slatePay = slateDT[slateRow + 1][payCol];
    var putPay = putDT[i][payCol2];
    
    help = 2;
    
    //Update the payment information
    if(putPay == "Payment Received" || putPay == slatePay) {
      payments.push([slatePay]);
      i++;
    } else {
      if(slateDT[slateRow + 1][payCol -1] != "NA") {
        payments.push(["FA - " + slatePay]);
      } else {
        payments.push([slatePay]);
      }
      i++;
    }
    
    //Update the travel information
    if(travelRow == -1) {
      travel.push(["", "", "", "", ""]);
    } else {
      var travelFields = travelDT[travelRow + 1].slice(1, 9);
      var travelLen = travelFields.length;
      for(var k = 0; k < travelFields.length; k++) {
        if(travelFields[k] == "X") {
          travelFields[k] = "";
        }
      }
      help = 3;
      if(travelFields[travelLen - 1] == "") {
        travelFields.pop();
      } else {
        travelFields[travelLen - 2] = travelFields[travelLen -1];
      }
      help = 4;
      travel.push(travelFields);
      help = 5;
    }
    
    //Update withdrawal
    if(withRow >= 0) {
      help = 6;
      putSS.getRange(i, putWith+1).setValue("Withdrawal");
      putSS.getRange(i, 1, 1, putDT[0].length).setBackground("red");
      putSS.getRange(i, 1, 1, putDT[0].length).setFontStyle("strikethrough");
    }
  }
  help = 3;

  putSS.getRange(2, payCol2 + 1, payments.length, payments[0].length).setValues(payments);
  putSS.getRange(2, putTravel + 1, travel.length, travel[0].length).setValues(travel);
}

function returnString(data, col, startRow){
  var rtrn = [];
  
  for(var i = startRow; i < data.length; i++) {
    rtrn.push(data[i][col].trim());
  }
  
  return rtrn;
}