function renameFiles() 
{
  //Define the variables
  var strName, strExt, strID;
  var file;

  //Get the Slate Download folder and files in it
  var folder = DriveApp.getFolderById('0B-xY5g-lVf8eeDE4QTdyWExadDg');
  var files = folder.getFilesByType(MimeType.PDF);
  
  //Process through the files and rename
  while(files.hasNext()) {
    //Get the name and extension
    file = files.next()
    strName = file.getName();
    strExt = strName.substring(strName.length-3, strName.length);
    
    var help = 1;
    
    if(strName.length > 13) {
      //Get the Banner ID
      strID = strName.substring(strName.length-14, strName.length-5);
      
      //Rename the file
      file.setName(strID + ".pdf");
    }
  }
   
}