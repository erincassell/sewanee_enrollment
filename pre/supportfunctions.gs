//Sorts an array by the column passed into the function and returns the array
function arraysort(sortarray, col) {
  sortarray.sort((function(index) {
    return function(a, b) {
      return (a[index] === b[index] ? 0 : (a[index] < b[index] ? -1 : 1));
    };
  }) (col));
  
  return sortarray;
}

//Returns the students from an array
//col is the column to check for the student's activity column to check
//family is the column where the family is stored on the student record
function rtrnStudents(students, col, family) {
  var rtrnArray = [];
  for(i = 0; i < students.length; i++) { //Loop through the student array
    var student = students[i];
    if(student[col] == 1 && student[family] == "Family") { //If the student has a 1 in that column and the student has not been put in a family, yet
      rtrnArray.push(student);
    }
  }
  return rtrnArray;
}

//Returns the families that have a the activity passed through the group
//Also checks the threshold
function rtrnFamilies(families, group, threshold) {
  var rtrnArray = [];
  for(var i = 0; i < families.length; i++) { //Loop through all of the families
    var family = families[i];
    
    //If the activity is the list of family activities, and the family has not hit it's threshold
    if(family[family.length-1].toLowerCase().search(group) >= 0 && family[family.length-2] < threshold) {
      rtrnArray.push(family)
    };
  }
  return rtrnArray;
}

//Checks a value. If not 1, return 0, otherwise 1.
function checkVal(val){
  if(val != 1) {
    return 0;
  } else {return 1};
}

//Processes through a student's unable activities and the family's activities
function checkUnable(unable, activities) {
  var rtrnVal = "OK";  //Set the default return value
  var i = 0;
  
  //Loop through the unable activites and trim the space
  for(var j = 0; j < unable.length; j++) {
    unable[j] = unable[j].trim();
  }
  
  //Look for and replace low ropes course, so it will match
  var index = unable.indexOf("Low ropes course");
  if(index >= 0) {
    unable[index] = "Low ropes";
  }
  
  //While there are still unable activities and a match hasn't been found
  while(i < unable.length && rtrnVal == "OK") {
    if(activities.indexOf(unable[i].trim()) >= 0) { //If an unable activity is in the list
      rtrnVal = "Nope";
    }
    i++;
  }
  return rtrnVal;
}