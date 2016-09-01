/**
 * @author: Eric Klawitter, modified by Derek Hong
 * @version: 4.0
 * 
 * Description: The Teacher Client
 * 
 * Designed to place text on canvas
 */



// GLOBAL VARIABLES SPECIFIC TO STUDENT
//assigns golbal variables for canvas
//tc and tctx are the equivalents for the teacher canvas
var tc = document.getElementById("teacherCanvas");
var tctx = tc.getContext("2d");
tctx.canvas.width= window.innerWidth;
tctx.canvas.height=window.innerHeight;


tc.style.zIndex= -1;
var ht = [[]];


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


document.getElementById("save").addEventListener("click", cleanUserDir);

document.getElementById("nextSlide").addEventListener("click", nextSlide);

document.getElementById("previousSlide").addEventListener("click", previousSlide);


//on mousedown:
//if text mode: saves box
//if shape mode: sets initX/Y
//otherwise alerts invalid input type
$("#canvas").mousedown(function (ev){
    curPos= nextPos;
    if(inputMode=="text"){
       saveBoxCommon();
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
    if (inputMode == "shape"){
        var canoffset = $(c).offset();
        shapeXFinal = ev.pageX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
        shapeYFinal = ev.pageY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;
        saveshapeCommon();
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

$(document).on('drag' , function(event){

    if (inputMode=="shape"){
        //alert();
        drag(event);
    }
});


//handlers for dropdown options
//identical to index teacher
$('#fontSize').change(function () {
    ctx.font = this.value + " " + "Arial";
    inputSize = this.value;
    if (boxPresent){
        document.getElementById("activeBox").style.fontSize = this.value;
    }
});

$("#fontColor").change(function () {
    var val = this.value;
    ctx.strokeStyle= val;
    ctx.fillStyle = val;
    inputColor = val;
    document.getElementById("activeBox").style.color = val;
});

$("#inputMode").change(function () {
    inputMode=this.value;
    if (inputMode == "shape"){
        saveBoxCommon();
    }
});
$("#shapeMode").change(function () {
    shapeMode=this.value;
});

//button handlers
document.getElementById("back").addEventListener("click", back);
document.getElementById("clear").addEventListener("click", clearAll);

//when receiving a new object from the teacher, pushes it onto the array and draws the item
socket.on('newObjFromTeacher', function(data) 
{               
    console.log('got it');
    
    ht.push(data)
    if (data.type == "text")
    {
        drawTextObj(data, tctx);
    }
    else if (data.type == "shape"){
        drawshapeObj(data, tctx);
    }
    else{
        alert("invalid data type");
    }
});

//when receiving an update, it replaces the data object and redraws the teacher's canvas
socket.on('updateFromTeacher', function(data){
    ht[data.index]= data;
    redraw(-2,tctx);
});



function nextSlide(){
  nextSlideCommon();
}

function previousSlide(){
  previousSlideCommon();
} 



}).call(this);