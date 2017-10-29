function processStudents() {
  processAthletes();
  processCohorts();
  processAcademic();  
}

/************************************************************************ /
/ Processes through the Athletes tab and puts the sports for the athlete  /
**************************************************************************/

function processAthletes() {
  //Get the spreadsheets and data from the spreadsheets
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var athleteSS = sa.getSheetByName("Athletes");
  var athleteDT = getDataValues(athleteSS.getName());
  
  //Get and find the important headers for processing
  var head = athleteDT[0];
  var headers = new Object();
  
  for(var i = 0; i < head.length; i++){
    switch(head[i]) {
      case "Ref":
        headers['ref'] = i;
        break;
      case "Sport1rating":
        headers['sport1'] = i;
        break;
      case "Sport2rating" :
        headers['sport2'] = i;
        break;
    }
  }

  //Process through the athletes and create the sport list
  for(i = 1; i < athleteDT.length; i++) {
    var athlete = athleteDT[i];
    var sports = "";
    sports += checkArchive(athlete[headers['sport1']-1], athlete[headers['sport1']]);
    sports += checkArchive(athlete[headers['sport2']-1], athlete[headers['sport2']]);
    var sport = sports.slice(0, sports.length-2);
    athleteSS.getRange(i+1, head.length+1).setValue(sport);
  }
}

//Given a sport and rating, returns the sport
function checkArchive(sport, rating) {
  var helper = 1;
  if(sport != "" && rating != "Archived") {
    return sport + ", ";
  } else {
    return "";
  }
}

/******************************************************************************** /
/ Processes through the cohort tab and puts and build the cohort for the student  /
/ ********************************************************************************/
function processCohorts() {
  //Get the spreadsheets and data from the spreadsheets
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var inputSS = sa.getSheetByName("Cohort");
  var inputDT = getDataValues(inputSS.getName());
  var cols = inputDT[0].length;
  
  for(var i = 1; i < inputDT.length; i++) {
    var student = inputDT[i];
    student.splice(8, 2);
    var cohorts = student.slice(2, 10);
    var cohort = checkValue(cohorts);
    if(cohort.length > 1) {
      cohort = cohort.trim();
      cohort = cohort.slice(0, cohort.length-1);
    }
    inputSS.getRange(i+1, cols+1).setValue(cohort);
  }
}

function checkValue(cohorts) {
  for(var j = 0; j < cohorts.length; j++){
    if(cohorts[j] != "") {
      cohorts[j] += ", ";
    }
  }
  return cohorts.join("");
}

/********************************************************* /
/ Process through the slate file and process a few fields
/**********************************************************/
function processAcademic() {
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var inputSS = sa.getSheetByName("From Slate");
  var inputDT = getDataValues(inputSS.getName());
  var cols = inputDT[0].length;
  
  var head = inputDT[0];
  var headers = new Object();
  
  for(var i = 0; i < head.length; i++){
    switch(head[i]) {
      case "Preprofessional":
        headers['preprof'] = i;
        break;
      case "A1finearts":
        headers['a1'] = i;
        break;
    }
  }
  
  var newValues = [];
  for(i = 1; i < inputDT.length; i++){
    var values = [];
    //Determine the pre-professional value
    var preprof = inputDT[i][headers['preprof']];
    switch(preprof) {
      case "Pre-health":
        preprof += " - " + inputDT[i][headers['preprof']+2];
        break;
      case "Engineering (3/2 program)":
        preprof += " - " + inputDT[i][headers['preprof']+1];
        break;
      case "X":
        preprof = "";
        break;
      default:
        preprof = preprof;
    }
    
    values.push(preprof);

    //Determine the A, B, C values
    var courses = inputDT[i].splice(headers['a1'], 60);
    courses = finalizeCourses(courses);
    
    for(var j = 0; j < courses.length; j+5) {
      var current = courses.splice(j, j+5);
      values.push(current.join(""));
      var helps = 1;
    }
    
    newValues.push(values);
    //Add to overall array
  }
    var help = 1;
  inputSS.getRange(2, cols+1, newValues.length, newValues[0].length).setValues(newValues);
}

function finalizeCourses(courses) {
  for(var i = 0; i < courses.length; i++) {
    if(courses[i] == "X") {
      courses[i] = "";
    }
  }
  return courses;
}

/******************** /
/ Do the course check /
/*********************/
function courseCheck() {
  var sa = SpreadsheetApp.getActiveSpreadsheet();
  var inputSS = sa.getSheetByName("Students to Merge");
  var inputDT = getDataValues(inputSS.getName());
  var cols = inputDT[0].length;
  var rows = 0;
  
  inputSS.clearFormats();
  
  var headers = inputDT[0];
  var courseHead = headers.indexOf("A1");
  var i = 0;
  
  while(i < inputDT.length) {
    if(inputDT[i][1] == "") {
      rows = i;
      i = 1000;
    }
    i++
  }
  
  var s = 1;
  
  for( i = 1; i < rows; i++) {
  
    if(inputDT[i][0] != "Passed") {
      //Get the courses
      var student = inputDT[i];
      var courses = student.slice(courseHead, courseHead+12);
      var match = "no match";
      while(courses.length > 0 && match == "no match") {
        var course = courses.shift();
        if(courses.indexOf(course) >= 0) {
          match = "match";
        }
      
        if(match == "no match") {
          inputSS.getRange(i+1, 1).setValue("Passed");
        } else {
          inputSS.getRange(i+1, 1).setValue("Failed");
          inputSS.getRange(i+1, 1, 1, inputSS.getLastColumn()).setBackgroundRGB(238, 232, 170);
        }
        var help = 1;
      }
    }
  }
  
  var helper = 1;
}