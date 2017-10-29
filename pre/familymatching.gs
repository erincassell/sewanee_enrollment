function matchStudents() {

  //Get spreadsheet and data information
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var masterSS = sa.getSheetByName("Master List");
  var groupSS = sa.getSheetByName("Family Groups");
  var threshSS = sa.getSheetByName("Thresholds");
  
  var groupDT = getDataValues(groupSS.getName());
  var threshDT = getDataValues(threshSS.getName());

  //Put the new sheets into the Gsheet if they don't already exist
  if(!sa.getSheetByName("Student Processing")) {
    var studentSS = sa.insertSheet(3).setName("Student Processing");
  } else {
    var studentSS = sa.getSheetByName("Student Processing");
  }
  
  if(!sa.getSheetByName("Family Processing")) {
    var familySS = sa.insertSheet(4).setName("Family Processing");
  } else {
    var familySS = sa.getSheetByName("Family Processing");
  }
  
  //Put Withdrawn in the Withdrawal column for "manual" withdraws
  var withdraw = masterSS.getRange(1, 1, 1, masterSS.getLastColumn()).getValues()[0].indexOf("Withdrawal");
  for(var u = 1; u <= masterSS.getLastRow(); u++) {
    if(masterSS.getRange(u, 1).getBackground() == "#ff0000") {
      masterSS.getRange(u, withdraw+1).setValue("Withdrawal");
    }
  }
  
  var masterDT = getDataValues(masterSS.getName());
  
  //Delete the first column
  for(var j = 0; j < masterDT.length; j++) {
    masterDT[j].shift();
  }
  
  //Find the column location for different headers
  var masterHeaders = [];
  masterHeaders["activities"] = masterDT[0].indexOf("Able_Activities");
  masterHeaders["gender"] = masterDT[0].indexOf("Gender");
  masterHeaders["unable"] = masterDT[0].indexOf("Unable_Activities");
  masterHeaders["ceeb"] = masterDT[0].indexOf("CEEB Code");
  masterHeaders["count"] = masterDT[0].indexOf("Count");
  masterHeaders["withdrawal"] = masterDT[0].indexOf("Withdrawal");
  masterHeaders["rock"] = masterDT[0].indexOf("Rock climbing");
  masterHeaders["cave"] = masterDT[0].indexOf("Caving");
  masterHeaders["ropes"] = masterDT[0].indexOf("Low ropes");
  masterHeaders["hike"] = masterDT[0].indexOf("Hiking");
  masterHeaders["canoe"] = masterDT[0].indexOf("Canoeing");
  masterHeaders["service"] = masterDT[0].indexOf("Community service");
  masterHeaders["family"] = masterHeaders["count"] + 1;
  masterHeaders["sex"] = masterDT[0].indexOf("Gender");
  
  //Process through the students and remove Withdrawn
  for(var j = 1; j < masterDT.length; j++) {
    if(masterDT[j][masterHeaders["withdrawal"]] == "Withdrawal") {
      masterDT.splice(j, 1); //Remove the students who are withdrawn
    }
  }
  
  //Process through the students and remove the blank lines in the array
  for(j = 1; j < masterDT.length; j++) {
    if(masterDT[j][0] == "") {
      masterDT.splice(j, 1);
      j--;
    }
  }
  
  //Remove everything after the activities column and count the activities
  var activities = {"rock": 0, "cave":0, "ropes":0, "hike":0, "canoe":0, "service":0};
  for(j = 0; j < masterDT.length; j++) {
    masterDT[j].splice(masterHeaders["count"]+1, masterDT[j].length - masterHeaders["count"]);
    masterDT[j].push("Family");
    if(j != 0) {
    activities["rock"] += checkVal(masterDT[j][masterHeaders["rock"]]);
    activities["cave"] += checkVal(masterDT[j][masterHeaders["cave"]]);
    activities["ropes"] += checkVal(masterDT[j][masterHeaders["ropes"]]);
    activities["hike"] += checkVal(masterDT[j][masterHeaders["hike"]]);
    activities["canoe"] += checkVal(masterDT[j][masterHeaders["canoe"]]);
    activities["service"] += checkVal(masterDT[j][masterHeaders["service"]]);
    }
  }
  
  //Add in the new header values into the family data
  var family = [["Family", "Rock climbing","Caving","Low ropes","Hiking","Canoeing","Community service","Male","Female","Total","Combined"]];
  var familyHead = family[0];
  var famGrpHead = groupDT[0];
  var activityOne = famGrpHead.indexOf("Activity One");
  var familyHeaders = [];
  familyHeaders["male"] = familyHead.indexOf("Male");
  familyHeaders["female"] = familyHead.indexOf("Female");
  familyHeaders["total"] = familyHead.indexOf("Total");
  familyHeaders["combined"] = familyHead.indexOf("Combined");
  familyHeaders["family"] = familyHead.indexOf("Family");
  
  //Process through the family data and push it into the family array
  //This function processes through the familyData provided and put it in the format we need for matching
  for(var n=1; n < groupDT.length; n++) {
    var familyRow = ["","","","","","",""];
    familyRow[0] = groupDT[n][0];
    for(var k = activityOne; k < activityOne+3; k++) {
      activity = groupDT[n][k];
      var column = familyHead.indexOf(activity);
      familyRow[column] = activity;
      }
    familyRow.splice(familyRow.length, 0, 0, 0, 0);
    familyRow.push(groupDT[n][famGrpHead.length-1]);
    family.push(familyRow);
  } 
  
  //Sort the activity hash from smallest to largest
  var activitysort = [];
  for(var key in activities) { //Move the hash into an array for sorting
    activitysort.push([key, activities[key]]);
  }
  activitysort = arraysort(activitysort, 1); //Sort the activities by the counts

  //Store the first row of the master and family data for later
  var masterHead = masterDT.shift(); //Remove the masterDT headers, so they don't get sorted
  var familyHead = family.shift(); //Remove the family headres, so they don't get sorted
  
  //For each activity process the students and families
  for(var a = 0; a < activitysort.length; a++) { 
    if(a == 0) {
      var activity = activitysort.splice(3, 1)[0]; //Get the third largest activity from the sorted activities
      help = 14;
    } else {
      var activity = activitysort.splice(0, 1)[0]; //Get the first in the array;
    }
 
    var studentDT = rtrnStudents(masterDT, masterHeaders[activity[0]], masterHeaders["family"]); //Get only the students for that activity
    studentDT = arraysort(studentDT, masterHeaders["sex"]); //Sort by the gender
    studentDT.reverse(); //Then reverse to put the males up front
    studentDT = arraysort(studentDT, masterHeaders["count"]); //Sort by the total count column ascending
    var familyDT = rtrnFamilies(family, activity[0], threshDT[1][2]); //Get only the families with that activity and that are less than the threshold
    familyDT = arraysort(familyDT, familyHeaders["total"]); //Sort the family data by the Total column ascending
    help = 13;
  
    for(j=0; j < studentDT.length; j++) { //Go through all of the students with this activity
      var student = studentDT[j];
      var k = 0;
      var matched = "No";
    
      //Go through all of the family data; stop if there is a match for this student
      while(k < familyDT.length && matched == "No") { 
      
        //Get the genders from the family
        var male = familyDT[k][familyHeaders["male"]];
        var female = familyDT[k][familyHeaders["female"]];
      
        //Increment the male/female values based on the student's sex
        if(studentDT[j][masterHeaders["sex"]] == "F") {
          female++;
        } else {
          male++;
        }
      
        //If the gender count is within the threshold
        if(male > threshDT[1][0] || female > threshDT[1][1]) {
        } else {
          var famActivities = familyDT[k][familyHeaders["combined"]];
          var unableA = studentDT[j][masterHeaders["unable"]];
        
          if(unableA != "") { //If the student has unable acitivies
            var check = checkUnable(unableA.split(","), famActivities); //Compare the unable activities to the family activities
          } else {
            var check = "OK";
          }
        
          //If the student made it through the checks
          if(check == "OK") {
            //Put the family name in the student's column
            studentDT[j][masterHeaders["family"]] = familyDT[k][familyHeaders["family"]];
          
            //Increment the gender count for the family
            if(studentDT[j][masterHeaders["sex"]] == "F") {
              familyDT[k][familyHeaders["female"]]++;
            } else {
              familyDT[k][familyHeaders["male"]]++;
            }
            familyDT[k][familyHeaders["total"]]++;
            matched = "Yes";
          }
        }
        k++;
      }
      familyDT = arraysort(familyDT, familyHeaders["total"]); //Sort the family data by the Total column ascending
    }
   }

   var i = 0; //Set i back to 0
   //Go through the masterDT and remove any blank rows
   while(i < masterDT.length && masterDT[i][0] == "") {
     masterDT.splice(i, 1);
     i++
   }
   
   //Go back through the students that did not match one more time
   familyDT = []; //Reset familyDT
   //Go through all of the families and find all of them that are less than the threshold - 1
   for(i = 0; i < family.length; i++) {
     if(family[i][familyHeaders["total"]] < threshDT[1][2]-1) {
       familyDT.push(family[i]);
     }
   }
   familyDT = arraysort(familyDT, familyHeaders["total"]); //Sort the families by the total to bring the lowest first
   
   studentDT = []; //Reset the studentDT
   //Go through the student data and find all unmatched without unable activities
   for(i = 0; i < masterDT.length; i++) {
     if(masterDT[i][masterHeaders["family"]] == "Family" && masterDT[i][masterHeaders["unable"]] == "") {
       studentDT.push(masterDT[i]);
     }
   }
   studentDT = arraysort(studentDT, masterHeaders["sex"]); //Sor the studentDT by sex
   studentDT.reverse(); //Reverse to bring the males to the front
   
   i = 0; //Reset i
   matched = "No"; //Set matched to No
   while(i < studentDT.length) { //Go through the students
     var activityChk = studentDT[i][masterHeaders["activities"]].split(","); //Put the activities into an array
     var b = 0;
     matched = "No";
     while(b < familyDT.length && matched == "No") { //Go through the family data until there is a match
       var fam = familyDT[b][familyHeaders["combined"]]; //Get the activities for the family
       var c = 0;
       while(c < activityChk.length && matched == "No") { //Go through the student's activities
         var index = fam.indexOf(activityChk[c].trim()); //Do a search on the activity in the family activity list
         if(index >= 0 && familyDT[b][familyHeaders["male"]] < threshDT[1][0]) { //If it was found and the males count is still less than the threshold
           studentDT[i][masterHeaders["family"]] = familyDT[b][familyHeaders["family"]]; //Put the student in that family
           
           //Increment the gender count for the family
           if(studentDT[i][masterHeaders["sex"]] == "F") {
             familyDT[b][familyHeaders["female"]]++;
           } else {
             familyDT[b][familyHeaders["male"]]++;
           }
           familyDT[b][familyHeaders["total"]]++;
           matched = "Yes";
         }
         c++;
       }
       b++;
     }
     familyDT = arraysort(familyDT, familyHeaders["total"]); //Sort the families to bring the lowest first
     i++;
   }
   
   //Clear the processing sheets
   studentSS.clear();
   familySS.clear();
   
   //Add the headers back to the data arrays
   masterDT.unshift(masterHead);
   family.unshift(familyHead);
   
   studentSS.getRange(1, 1, masterDT.length, masterDT[0].length).setValues(masterDT); //Put student data into the student processing
   studentSS.getRange(2, 1, studentSS.getLastRow()-1, studentSS.getLastColumn()).sort(studentSS.getLastColumn()); //Sort students by the families and then name
   familySS.getRange(1, 1, family.length, family[0].length).setValues(family); //Place the families in the sheet
}