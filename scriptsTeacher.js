/**
 * @author: Eric Klawitter, modified by Derek Hong
 * @version: 4.0
 * 
 * Description: The Teacher Client
 * 
 * Designed to place text on canvas
 */

//cleanRoom();


(function (){

//var socket = io.connect('notepad.pingry.org:4000');
	var socket = io.connect('10.13.102.77:4000');
	
/**Rooms Setup ************************************************************************
 * Analyzes URL for room name and joins corresponding room
 */

    //Type: Int; stores the location within the document URL of the questionmark for data splicing (finding querystring)
    var Index = document.URL.indexOf("?");  
    
    //Type: String; based on whether the index exists, the room is either the string after the index number in the URL, or a test room
    var Room = Index == -1 ? "Test" : document.URL.substring(Index + 1); //plus 1 gets rid of question mark
    
    /**
     * When the socket connects (recieving 'connect' as a command) 
     * it emits it's room choice to the socket.io server, which 
     * then handles room delegation. 
     * 
     * This is done to ensure that multiple teachers only communicate with their own students
     * 
     * @Param: 'connect'; name of command that socket is listening for
     * @Param: function; callback upon recieving command
     */
    socket.on('connect', function() 
    {
        // Connected, let's sign-up for to receive messages for this room
        socket.emit('room', Room);
    });
    
    /**
     * When a room is joined, the app alerts the user (mostly debugging tool)
     * 
     * @Param: 'Joined'; name of command that socket is listening for
     * @Param: function; callback upon recieving command
     *      @Param: data; data passed along from server to client through 
     *              socket.io in String form
     */
    socket.on('Joined', function(data) 
    {
        alert("You joined: " + Room);
    });

/**End of Rooms Setup **************************************************************************/

//event listeners for buttons

//NEED SOCKET.IO HERE, when teacher goes back and updates, students need to update.
//
document.getElementById("back").addEventListener("click", backTeacher);


//need-ish to have, when teacher clears, user clears
document.getElementById("clear").addEventListener("click", clearAll);

document.getElementById("save").addEventListener("click", cleanUserDir);


//nice to have: button to go to teacher slide
document.getElementById("nextSlide").addEventListener("click", nextSlide);

document.getElementById("previousSlide").addEventListener("click", previousSlide);




//on mousedown:
//if text mode: saves box
//if shape mode: sets initX/Y
//otherwise alerts invalid input type
$("#canvas").mousedown(function (ev){
    curPos= nextPos;
    if(inputMode=="text"){
       saveBox();
    }
    else if (inputMode == "shape"){
        var canoffset = $(c).offset();
        shapeXInit = ev.pageX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
        shapeYInit = ev.pageY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;
        return;

    }
    else {
        alert("invalid input mode");
        alert(inputMode);
    }
});


//on mouseup
//if shape: is the endpoints
//if text, creates a box
$("#canvas").mouseup(function (ev){
    clearTemp();
    if (inputMode == "shape"){
        var canoffset = $(c).offset();
        shapeXFinal = ev.pageX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
        shapeYFinal = ev.pageY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;
        saveshape();
        return;
    }
    else if (inputMode == "text"){
        var canoffset = $(c).offset();
        boxX = ev.pageX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
        boxY = ev.pageY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;

        //creates the box
        drawBox();
        return;
    }
});




//updates an item if user went "back" and altered text or size or color
function updateCur(){
   updateCurCommon();
    //#################### send the stuff ###############################
    //sends the updated item to the student
    socket.emit('updateFromTeacher', h[curPos]);
}


//when the user drags, check if input mode is shape
//if so, calls common drag event
$(document).on('drag' , function(event){

    if (inputMode=="shape"){
        //alert();
        drag(event);
    }
});

//handlers for dropdown options

//changes font/line size
$('#fontSize').change(function () {
    ctx.font = this.value + " " + "Arial";
    inputSize = this.value;
    if (boxPresent){
        document.getElementById("activeBox").style.fontSize = this.value;
    }
});

//changes line/font color
$("#fontColor").change(function () {
    var val = this.value;
    //console.log(val);
    ctx.strokeStyle= val;
    ctx.fillStyle = val;
    inputColor = val;
    document.getElementById("activeBox").style.color = val;
});

//switches between text based and shape based input
$("#inputMode").change(function () {
    inputMode=this.value;
    if (inputMode == "shape"){
        saveBox();

    }
});


$("#shapeMode").change(function () {
    shapeMode=this.value;
});

//NEED SOCKET.IO HERE
//basically whenever updateCurCommon is called
//trouble with referencing caused the updateCur in this file (scripts teacher) to not be used

//if the teacher hits back, calls normal back
//emits updated item
function backTeacher(){
    back();
}

//NEED SOCKET.IO HERE, when teacher saves box, student needs to have the same text
//teacher's save box
//calls standard save box
//emits new item
function saveBox(){
    saveBoxCommon();
    socket.emit('newObjFromTeacher', h[curPos-1]);
}

//NEED SOCKET.IO HERE, when teacher saves shape, student needs to save shape
//saves shape
//emits shape to student
function saveshape(){
    saveshapeCommon();
    //#################### send the stuff ###############################
    //now sends the new item for the student to add to the teacher history array
    socket.emit('newObjFromTeacher', h[curPos-1]);


}

/*
$('input[type="file"]').ajaxfileupload({
       'action': 'UploadServlet',           
   'onComplete': function(response) {        
         $('#upload').hide();
         alert("File SAVED!!");
       },
       'onStart': function() {
         $('#upload').show();
       }
  });
*/

//updates filename to the file about to be uploaded
var fileName= "notuploaded";
$(':file').change(function(){
    var file = this.files[0];

    fileName= file.name;
});

//validates that the user has selected a .pptx for upload
$('#uploadButton').click(function(){
       if (fileName.indexOf(".pptx")== -1){
          console.log(fileName);
          alert("please upload a .pptx file");
          return;
       }
      document.getElementById("roomID").value = roomID;
    performAjaxSubmit();

});


//NEED SOCKET.IO HERE, all users need to have variable numslides, both for users joining the room
//and for users already in the room
function performAjaxSubmit() {

        var sampleText = document.getElementById("roomID").value;
        var sampleFile = document.getElementById("sampleFile").files[0];
        var formdata = new FormData();

        formdata.append("sampleText", sampleText);
        formdata.append("sampleFile", sampleFile);
        var xhr = new XMLHttpRequest();       
        xhr.open("POST","UploadServlet", true);
        xhr.send(formdata);
        xhr.onload = function(e) {
            if (this.status == 200) {
               //console.log(this.responseText);
               numSlides=parseInt(this.responseText);
               updateImg();
            }
        };                    
    }   

//place to add nice to have socket.io stuff for going to teacher slide
//not necessary immediately
function nextSlide(){
  nextSlideCommon();
}

function previousSlide(){
  previousSlideCommon();
} 




}).call(this);