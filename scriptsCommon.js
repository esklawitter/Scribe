/**
 * @author: Eric Klawitter, modified by Derek Hong
 * @version: 4.0
 * 
 * Description: The Teacher Client
 * 
 * Designed to place text on canvas
 */


var numSlides=0;
var backgroundPresent= false;

//assigns golbal variables for canvas
var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
ctx.canvas.width= window.innerWidth;
ctx.canvas.height=window.innerHeight;

var tempC= document.getElementById("temporaryCanvas");
var tempCTX= tempC.getContext("2d");
tempCTX.canvas.width= window.innerWidth;
tempCTX.canvas.height=window.innerHeight;


/* Stores history of all text boxes and shapes
properties:
slide: the slide the item belongs on
index: index in h
type: text || shape
color: #fffffff
startPosX: for text box: upper left, for shape, point 1
startPosY: for text box, upper left, for shape, point 1
endPosX: lower right for text, point 2 for shape
endPosY: lower right for text, point 2 for shape
content: string of text for shape
size: text/shape size

*/
//now a double array, one array for each slide
var h = [[]];
//next position represents the next index to h where an item will be added
var nextPos=0;
//cur pos is the index in h that one is currently at
//used only for the "back" button functionality
var curPos=0;
//tracker for which slide the user is on
var curSlide=0;

//sets font size/style
ctx.font = "13px Arial";

//whether or not a text box is open on the page
var boxPresent = false;

//coordinates of the box
var boxX;
var boxY;

//coordinates of the shape
var shapeXTemp;
var shapeYTemp;
var shapeXInit;
var shapeYInit;
var shapeXFinal;
var shapeYFinal;

//listens for clicking and calls getClickPosition
//c.addEventListener("click", getClickPosition, false);



//establishes clear button
//document.getElementById("clear").onclick = clear();

//input box style
var inputColor = "black";
var inputSize = "13px";
var inputMode = "text";
var shapeMode= "line";

//listens for user pressing enter, closes activeBox
window.addEventListener('keypress', enter);

//button handlers

//updateImg();


var roomID= "generic";
if (document.URL.lastIndexOf("?") != -1){
    roomID= document.URL.substring(document.URL.lastIndexOf("?") +1);       
}

function test(){
	//alert(testVar);
}




//saves shape to h
//calls draw shape to draw new shape
function saveshapeCommon(){
     var toAdd= {
            slide: curSlide,
            index:curPos,
            type: 'shape' ,
            style: shapeMode,
            color: inputColor,
            startPosX: shapeXInit,
            startPosY: shapeYInit,
            endPosX: shapeXFinal,
            endPosY: shapeYFinal,
            size: inputSize,

        }
    h[curSlide].push(toAdd);
    curPos++;
    nextPos++;
    drawshapeObj(toAdd, ctx);
}

//NEW FUNCTION
//draws shape like old drawshape() except now does it from an item in history
function drawshapeObj(l, context)
{
	context.strokeStyle= l.color;
	context.fillStyle= l.color;

	context.lineWidth= parseInt(l.size)/6;
	if (l.style == "line"){
		context.beginPath();
		context.moveTo(l.startPosX, l.startPosY);
		context.lineTo(l.endPosX, l.endPosY);
		context.stroke();
		context.closePath();

	}
	else if (l.style == "box"){
		context.beginPath();
		context.rect(l.startPosX, l.startPosY, l.endPosX - l.startPosX, l.endPosY - l.startPosY);
		context.stroke();
		context.closePath();

	}
	else if (l.style == "oval"){
		ellipse(l, context);
	}

}

//calculates center and radius based on item, passes to helper methods
function ellipse(l, context){
	var cx= (l.startPosX + l.endPosX) / 2;
	var cy= (l.startPosY + l.endPosY) / 2;
	var rx= Math.abs(l.startPosX - l.endPosX)/2;
	var ry= Math.abs(l.startPosY - l.endPosY)/2;
	 ellipseBezier(context, cx, cy, rx*2, ry*2);
}


//used to draw elipse with bezier curve
//a bit messy after multiple iterations
function ellipseBezier(ctx, cx, cy, w, h) {
	drawEllipseWithBezier(ctx, cx - w/2.0, cy - h/2.0, w, h);
}

//magic
function drawEllipseWithBezier(ctx, x, y, w, h) {
	var kappa = .5522848,
	    ox = (w / 2) * kappa, // control point offset horizontal
	    oy = (h / 2) * kappa, // control point offset vertical
	    xe = x + w,           // x-end
	    ye = y + h,           // y-end
	    xm = x + w / 2,       // x-middle
	    ym = y + h / 2;       // y-middle

	ctx.save();
	ctx.beginPath();
	ctx.moveTo(x, ym);
	ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
	ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
	ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
	ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
	ctx.stroke();
	ctx.restore();
}




//draws box onto the canvas and styles it accordingly
function drawBox () {
        var box = document.createElement('textarea'); // creates the element
        box.id = "activeBox";
       //places box at user's where the user clicked
        box.style.position = 'absolute'; // position it
        box.style.left = boxX + 'px';
        box.style.top = boxY + 'px';

        //styles box
        box.style.color = inputColor;
        box.style.width = "200px";
        box.style.fontSize = inputSize;

        boxPresent = true;
        document.body.appendChild(box); // add it as last child of body elemnt
        //places cursor in box
       box.focus();
}


//converts text box to writing on canvas
//would be where to implement socket.io to send info to student canvas
function saveBoxCommon () {
    if (boxPresent){
        var box = document.getElementById("activeBox");
        if (curPos== nextPos){
            if (box.value == "")
            {
                $("#activeBox").remove();
            }
            else{
                var toAdd= {
                    slide: curSlide,
                    index: curPos,
                    type:"text",
                    color: inputColor,
                    startPosX: box.style.left,
                    startPosY: box.style.top,

                    endPosX: parseInt(box.style.left) + parseInt(box.style.width) + "px",
                    endPosY: parseInt(box.style.top) - parseInt(box.style.height) + "px",
                    content: box.value,
                    size: inputSize,
                }
                h[curSlide].push(toAdd);
                curPos++;
                nextPos++;
                $("#activeBox").remove();


                    //#################### send the stuff ###############################
                 //now sends the new item for the student to add to the teacher history array
            }
        }
        else{
            updateCurCommon();
        }
            boxPresent= false;
    }

    redraw(-2, ctx);
    return;
}

//event handler to see if user pressed enter
function enter (e) {
    if (e.keyCode === 13) {
        saveBoxCommon();
    }
    return;
}


//common updater for using the back button
//updates all attributes that could have been changed by undo method
function updateCurCommon(){
	 var c = curPos
    var box = document.getElementById("activeBox");
    h[curSlide][c].endPosX = parseInt(box.style.left) + parseInt(box.style.width) + "px";
    h[curSlide][c].endPosY= parseInt(box.style.top) - parseInt(box.style.height) + "px";
    h[curSlide][c].content= box.value;
    h[curSlide][c].color= box.style.color;
    h[curSlide][c].size= box.style.fontSize;
}

//redraws all items on canvas
//@param n the number to be undrawn to be drawn as editable
//pass -2 to draw all objects without alert
function redraw(n, context){
    clear();
    //-1 only reached by pressing back too many times
    if (n == -1){
        alert("you've reached the last item!")
    }
    if (n== -2){
        for (i = 0; i < h[curSlide].length; i++){
            if(h[curSlide][i].type == "shape")
            {
                drawshapeObj(h[curSlide][i], context);
            }
            else{
                wrapTextObj(h[curSlide][i], context);
            }
        }
    }
    else{
        for (i = 0; i< n ; i++){
             if(h[curSlide][i].type == "shape")
            {
                drawshapeObj(h[curSlide][i], context);
            }
            else{
                wrapTextObj(h[curSlide][i], context);
            }
        }
        for (i=n+1; i<h[curSlide].length; i++){
             if(h[curSlide][i].type == "shape")
            {
                drawshapeObj(h[curSlide][i], context);
            }
            else{
                wrapTextObj(h[curSlide][i], context);
            }
        }
        drawEditable(n);
    }   
}

//draws editable text box
//draws box/content from h[curSlide][n]
function drawEditable(n){
    document.getElementById('inputMode').value="text";
    inputMode="text";
    var box = document.createElement('textarea'); // creates the element
    box.id = "activeBox";
    //places box at user's where the user clicked
    box.style.position = 'absolute'; // position it
    box.style.left = h[curSlide][n].startPosX;
    box.style.top = h[curSlide][n].startPosY;

    //styles box
    box.style.color = h[curSlide][n].color;
    box.style.width = parseInt(h[curSlide][n].endPosX) - parseInt(h[curSlide][n].startPosX) + "px";
    box.style.fontSize = h[curSlide][n].size;
    box.value= h[curSlide][n].content;

    boxPresent = true;
    document.body.appendChild(box); // add it as last child of body elemnt
    //places cursor in box
    box.focus();

}


//similar to previous wrapText, now takes param t for the index of the box to be drawn
//i tried to copy the socket.io code, probably a more efficient way now that it is redrawn every update
function wrapTextObj(t, context){
     //magic number
     context.fillStyle=t.color;
     context.font=t.size + " Arial";
    var lineHeight= parseInt(t.size);
    //splits the words by spaces
    var words = t.content.split(' ');
    //represents the line to be added
    var line = '';
    //various magic numbers for making text look exactly like it did in the box
    //boxY+=(parseInt(inputSize) * 1.4);
    var bX= parseInt(t.startPosX);
    var bY= parseInt(t.startPosY);
    bY+=0.9295 * (parseInt(t.size)) + 4.86
    bX+=3;

    maxWidth= parseInt(t.endPosX) - parseInt(t.startPosX);
    //looks at each word, adds it to the line if it will stay under max width
    for(var n = 0; n < words.length; n++) {
        var testline = line + words[n] + ' ';
        var metrics = context.measureText(testline);
        var testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
        context.fillText(line, bX, bY);
        line = words[n] + ' ';
        bY += lineHeight;
        }

        else {
        line = testline;
        }
    }
    context.fillText(line, bX, bY);
    context.stroke();
    context.closePath();

}


//function called when user clicks back
//saves box if not the first time clicking
//removes active box
//decreases the current position
//searches for most recent text box (skips shapes)
function back(){
    if (curPos != nextPos){
        saveBoxCommon();
    }
    $("#activeBox").remove();
    curPos--;
    while (h[curSlide][curPos].type != "text" && curPos >=-1)
    {
        curPos--;
    }
    redraw(curPos, ctx);
}


//helper function for clearing the canvas
function clear()
{
	$("#activeBox").remove();
	ctx.clearRect(0,0,2000,2000);
	return;
}


//helper method for clearing temporary canvas
function clearTemp(){
	tempCTX.clearRect(0,0,2000,2000);
	return;
}

//same as other clear, also clears history

function clearAll()
{
	$("#activeBox").remove();
	ctx.clearRect(0,0,2000,2000);
	h[curSlide] = [];
	curPos= 0;
	nextPos= 0;
	return;
}

//handles the user dragging
//draws a shape on to the temporary canvas as the user's mouse moves
//no need to handle objects on the temporary canvas
function drag(ev){
	clearTemp();
	    var canoffset = $(c).offset();
        shapeXTemp = ev.pageX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
        shapeYTemp = ev.pageY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;
	     var toDraw= {
            type: "shape",
            style: shapeMode,
            color: inputColor,
            startPosX: shapeXInit,
            startPosY: shapeYInit,
            endPosX: shapeXTemp,
            endPosY: shapeYTemp,
            size: inputSize,
        }
        drawshapeObj(toDraw, tempCTX);
}

//helper function for saving an individual slide to the server
//no need for socket.io here
function save(){
    //var slides= []
    //slides.push(c.toDataURL('image/png'));
    var roomID= "generic";
    if (document.URL.lastIndexOf("?") != -1){
        roomID= document.URL.substring(document.URL.lastIndexOf("?") +1);
        
    }
    console.log("room= " + roomID);
    $.ajax({
        url: 'SaveFromURL',
        type: 'POST',
        room: roomID,
        data:{
           imgBase64: c.toDataURL('image/png'),
           room:roomID,
           slideID: curSlide,
        },
        success:
            function(msg){
                console.log("Image Successfully Saved");
            },
            error: function(jqXHR, textStatus, errorThrown){
                console.log(errorThrown);
            }
        });

    }
//handler for saving all the slides
//calls the save() method for each slide and on completion fo that converts to new powerpoint
function saveAll(){
    var returnSlide= curSlide
    curSlide=0;
    redraw(-2, ctx);
    save();
    for (var i=0; i < h.length-1; i++){
        nextSlideCommon();
        redraw(-2, ctx);
        save();
    }
    $.ajax({
        url: 'Export',
        type: 'POST',
        room: roomID,
        data:{
           room:roomID,
        },
        success:
            function(msg){
                //$("#saveAll").submit();
            },
            error: function(jqXHR, textStatus, errorThrown){
                console.log(errorThrown);
                console.log(textStatus);
                console.log(jqXHR);
            }
        });
}

//helper method, cleans out old user images when saving the powerpoint
function cleanUserDir(){
    $.ajax({
        url: 'CleanRoom',
        type: 'POST',
        room: roomID,
        data:{
            room:roomID,
        },
        success:
            function(){
                saveAll();
            },
       error: function(jqXHR, textStatus, errorThrown){
                console.log(errorThrown);
                console.log(textStatus);
                console.log(jqXHR);
            } 
    });
}
 
 //currently not working, handles downloading the file to the user's machine/uploading to google drive
function download(){
     $.ajax({
        url: 'Download',
        type: 'POST',
        room: roomID,
        data:{
           room:roomID,
        },
        success:
            function(msg){
                console.log("download successful");
            },
            error: function(jqXHR, textStatus, errorThrown){
                console.log(errorThrown);
                console.log(textStatus);
                console.log(jqXHR);
            }
        });
     Console.log("downloaded?")
}

//handles moving to the next slide
//if there is a box,s aves it
//increments to the next slide
//if there isn't an existing array in h for the slide, creates it
//redraws teh canvas for the selected slide
//updates the background
function nextSlideCommon(){
    if (boxPresent){
        saveBoxCommon();
    }
    curSlide++;
    if(curSlide >= h.length){
        h.push([])
    }
    redraw(-2, ctx);
    updateImg();

}


//same as above, but no need to add a new index to h
//in order to go backwards to a slide the user must have already passed it
function previousSlideCommon(){
    if(curSlide >0){
        if (boxPresent){
            saveBoxCommon();
        }
        curSlide--;
        redraw(-2, ctx);
        updateImg();
    }
}

/* The folder structure on the server enables a known path for each slide
the images are served as static iamges from the server.
Adds the ?+date to the end to force the browser to reload the image every time it views it
in the future we want to eliminate this but the teacher version used to have bugs with caching images
*/
function updateImg(){
    if (backgroundPresent){
        $("#background").remove();
    }
    if (curSlide >= numSlides){
        return;
    }
        var loc = window.location.pathname;
        var dir = loc.substring(0, loc.lastIndexOf('/'))+ "/rooms/";
        var img = document.createElement('img');
        img.src = dir+ roomID + "/presentation/slide-" + (curSlide+1) + ".png?" + new Date();
        img.id="background";
        document.getElementById('slideImgContainer').appendChild(img);
        backgroundPresent= true;
}

//handles cleaning the room then saving all the images when the button is pressed on the ui
function cleanRoom(){
    //var slides= []
    //slides.push(c.toDataURL('image/png'));
    var roomID= "generic";
    if (document.URL.lastIndexOf("?") != -1){
        roomID= document.URL.substring(document.URL.lastIndexOf("?") +1);        
    }
    $.ajax({
        url: 'CleanRoom',
        type: 'POST',
        room: roomID,
        data:{
           room:9,
        },
        success: function(data, textStatus, jqXHR)
            {
               console.log(data); 
            },
        error: function(jqXHR, textStatus, errorThrown){
                alert(errorThrown);
            }
        });

    }