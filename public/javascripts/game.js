var kin;
var canvasWidth = 800;
var canvasHeight = 500;
var borderWidth = 10;

/**
 * slight whoopsie - X = y and Y = x
 */

var bikeCoord = {x : 400, y: 400, height: 10, width: 10};
var oppCoord = {x : 400, y: 400, height: 10, width: 10};
var startPos1 = {x : 400, y: 200, height: 10, width: 10};
var startPos2 = {x : 400, y: 700, height: 10, width: 10};
var startCoord;

var bikeHistory = [];
var oppHistory = [];


var maxBikeLength = 10;
var bikeSpeed = 100;

var startingDirection = "up";
var historyDirection;
var currentDirection;

$(document).ready(function(){
	bikeCoord = startCoord;
	
	//$('body').keypress(changeDirection);
		document.onkeydown = function(event) {
			if(state == "Player1" || state == "Player2") {
			  var keyCode;
			  if(event == null) {
			    keyCode = window.event.keyCode; 
			  } else {
			    keyCode = event.keyCode; 
			  }
			  changeDirection(keyCode);
			} else {
				/** spectators cannot change canvas */
			}
		}

	
	 kin = new Kinetic_2d("gameMap");
    
    currentDirection = startingDirection;

    // set drawStage method
    kin.setDrawStage(function(){
    	if(bikeCoord) {
	    	updateBikeHistory("myBike",bikeCoord);
	    	updateStage();
	        kin.clear();
	        drawBoundingBox();
	        showFPS();
	    
	        var context = kin.getContext();
	    	drawBike("myBike",bikeCoord);
    	}
    });

});

function showFPS() {
    var context = kin.getContext();
	context.font = "8pt Calibri";
    context.fillText("fps: "+kin.getFps(), 10, 10);
}

/* detect change in direction */
function changeDirection(key) {
	if(key == 87) {
		currentDirection = "up";
	} else if(key == 65) { 
		currentDirection = "left";
	} else if(key == 83) { 
		currentDirection = "down";
	} else if(key == 68) { 
		currentDirection = "right";
	}
   	now.sendMove(gameId,"Player",bikeCoord,currentDirection);

}

/** update stage - new coord */
function updateStage() {
	var linearDistEachFrame = bikeSpeed * kin.getTimeInterval() / 1000;
    
	/*
	 * check outside borders for collision / end game
	 */
    if(currentDirection == "down") { // move down
        var currentX = bikeCoord.x;
	    if (currentX < (kin.getCanvas().height- bikeCoord.height*2 - borderWidth)) { // move down
	        var newX = currentX + linearDistEachFrame;
	        bikeCoord.x = newX;
	    } else {
	    	endGame();
	    }
    } else if(currentDirection == "up") { // move up
        var currentX = bikeCoord.x;
	    if (currentX > 0) { // move down
	        var newX = currentX - linearDistEachFrame;
	        bikeCoord.x = newX;
	    } else {
	    	endGame();
	    }
    } else if(currentDirection == "left") { // move left
        var currentY = bikeCoord.y;
	    if (currentY > 0) { // move down
	        var newY = currentY - linearDistEachFrame;
	        bikeCoord.y = newY;
	    } else {
	    	endGame();
	    }
    } else if(currentDirection == "right") { // move right
        var currentY = bikeCoord.y;
	    if (currentY < (kin.getCanvas().width- bikeCoord.height*2 - borderWidth)) { // move down
	        var newY = currentY + linearDistEachFrame;
	        bikeCoord.y = newY;
	    } else {
	    	endGame();
	    }
    }
    
    /**
     * if we are a player - send our move to our gameGroup through nowJS
     */
}



/** end game **/
function endGame() {
	kin.stopAnimation();
}


/** update previous bike positions - limit **/
function updateBikeHistory(whichBike,bikeData) {
	var historyCoord = {x : 0, y: 0, height: 1, width: 1};

	if(whichBike == "myBike") {
		var history = bikeHistory;
	} else {
		var history = oppHistory;
	}
	if(historyDirection != currentDirection) {
		historyCoord.x = bikeData.x + (bikeData.width/2);
		historyCoord.y = bikeData.y + (bikeData.height/2);

		if(historyDirection == "up" && bikeHistory[0]) {
			bikeHistory[0].x = historyCoord.x;
		}
		/*
		if(historyDirection == "down" && bikeHistory[0]) {
			bikeHistory[0].height = historyCoord.height;
		}
		
		if(currentDirection == "left" && bikeHistory[0]) {
			bikeHistory[0].y = historyCoord.y;
			//historyCoord.x = bikeData.x + bikeData.width;
		}

		if(currentDirection == "right" && bikeHistory[0]) {
			bikeHistory[0].width = historyCoord.width;
			//historyCoord.x = bikeData.x + bikeData.width;
		}*/

//		historyCoord.width = bikeData.width;
//		historyCoord.height = bikeData.height;

		var historyLength = bikeHistory.unshift(historyCoord);
//		console.log(bikeHistory);
		
		historyDirection = currentDirection;
		
	}
	
	
    if(historyDirection == "down") { // move down
    	bikeHistory[0].height = bikeData.x - bikeHistory[0].x;
    
    } else if(historyDirection == "up") { // move up
    	bikeHistory[0].x = bikeData.x;
    	/** to calculate width - we need to either have a previous coordinate, or a starting position */
    	if(bikeHistory[1]) {
    		bikeHistory[0].height = bikeHistory[1].x - bikeData.x;
    	} else {
    		bikeHistory[0].height = startCoord.x - bikeData.x;
    	}

    } else if(historyDirection == "left") { // move left
    	bikeHistory[0].y = bikeData.y;
    	/** to calculate width - we need to either have a previous coordinate, or a starting position */
    	if(bikeHistory[1]) {
    		bikeHistory[0].width = bikeHistory[1].y - bikeData.y;
    	} else {
    		bikeHistory[0].width = startCoord.y - bikeData.y;
    	}
    	
    } else if(historyDirection == "right") { // move right
    	bikeHistory[0].width = bikeData.y - bikeHistory[0].y;
    
    }

    if(bikeHistory.length > maxBikeLength) {
    	bikeHistory.splice(maxBikeLength,(bikeHistory.length-maxBikeLength));
	}

}

/** draw bike **/
function drawBike(bikeId,bikePosition) {
	var context = kin.getContext();
	
	/** draw history blocks in different colour - then layer bike ontop */
	context.beginPath();
	for ( var int = 0; int < bikeHistory.length; int++) {
		var history = bikeHistory[int];
		
		//console.log("draw: "+int);
		
	    context.rect(history.y, history.x, history.width, history.height);
	 
	    context.fillStyle = "#ccc";
	    context.fill();
	    context.lineWidth = 2;
	    context.strokeStyle = "red";
	}
    context.stroke();
	
    /*
     * detect collision with a line (lazy detection
     */
    if(checkCollision(bikePosition.x,bikePosition.y,bikePosition.width,bikePosition.height)) {
//    	endGame();
    }
	var left = bikePosition.x;
	var top = bikePosition.y;
		
	context.beginPath();
    context.rect(top, left, bikePosition.width, bikePosition.height);
 
    context.fillStyle = "#8ED6FF";
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = "blue";
    context.stroke();
	
}

/*
 * check for non-Black bar on new area
 */
function checkCollision(x,y,width,height) {
	var context = kin.getContext();
	var imgd = context.getImageData(x, y, width, height);
	var pix = imgd.data;
	for (var i = 0; n = pix.length, i < n; i += 4) {
//		console.log(pix[i]);
		if (pix[i] != 0) {
//			console.log(pix[i]);
			return true;
		}
	}
	return false;
}

/**
 * draw game area
 */
function drawBoundingBox() {
	var context = kin.getContext();
	context.beginPath();
    context.rect(0, 0, canvasWidth, canvasHeight);
 
    context.lineWidth = 5;
    context.strokeStyle = 'red';
    context.stroke();
}