var kin;
var canvasWidth = 800;
var canvasHeight = 500;
var borderWidth = 10;
var gameState = "running";
/**
 * slight whoopsie - X = y and Y = x
 */

var bikeCoord = {};
	bikeCoord["Player1"] = ({x : 400, y: 400, height: 10, width: 10});
	bikeCoord["Player2"] = {x : 400, y: 400, height: 10, width: 10};

//var startPos1 = {x : 400, y: 200, height: 10, width: 10};
//var startPos2 = {x : 400, y: 700, height: 10, width: 10};
var startCoord = {};
	startCoord["Player1"] = {x : 400, y: 200, height: 10, width: 10};
	startCoord["Player2"] = {x : 400, y: 700, height: 10, width: 10};

var bikeHistory = {};
	bikeHistory["Player1"] = [];
	bikeHistory["Player2"] = [];


var maxBikeLength = 10;
var bikeSpeed = 100;

var startingDirection = [];
	startingDirection["Player1"] = "up";
	startingDirection["Player2"] = "left";

var historyDirection = {};
	historyDirection["Player1"];
	historyDirection["Player2"];

var currentDirection = {};
	currentDirection["Player1"] = 'up';
	currentDirection["Player2"] = 'down';

$(document).ready(function(){
	bikeCoord["Player1"] = startCoord["Player1"];
	bikeCoord["Player2"] = startCoord["Player2"];
	
	//$('body').keypress(changeDirection);
		document.onkeydown = function(event) {
			if(state == "Player1" || state == "Player2") {
			  var keyCode;
			  if(event == null) {
			    keyCode = window.event.keyCode; 
			  } else {
			    keyCode = event.keyCode; 
			  }
			  changeDirection(state,keyCode);
			} else {
				/** spectators cannot change canvas */
			}
		}

	
	 kin = new Kinetic_2d("gameMap");
    
    currentDirection = startingDirection;

    // set drawStage method
    kin.setDrawStage(function(){
    	if(gameState == "running") {
    		
	    	updateBikeHistory(state);
	        kin.clear();
	    	updateStage();
	        drawBoundingBox();
	        showFPS();
	        var context = kin.getContext();
	    	drawBike(state);
    	}
    });

});

function showFPS() {
    var context = kin.getContext();
	context.font = "8pt Calibri";
    context.fillText("fps: "+kin.getFps(), 10, 10);
}

/* detect change in direction */
function changeDirection(bikeState,key) {
	if(key == 87) {
		currentDirection[bikeState] = "up";
	} else if(key == 65) { 
		currentDirection[bikeState] = "left";
	} else if(key == 83) { 
		currentDirection[bikeState] = "down";
	} else if(key == 68) { 
		currentDirection[bikeState] = "right";
	}
   	//now.sendMove(gameId,bikeState,bikeCoord[bikeState],currentDirection[bikeState]);

}

/** update stage - new coord */
function updateStage() {
	var linearDistEachFrame = bikeSpeed * kin.getTimeInterval() / 1000;
	var playerNames =  {names:"Player1"/*, "Player2"*/};

	for (playerPos in playerNames)	{
		var player = playerNames[playerPos];
		
		/**
		 * setup current direction if starting
		 */
		if(currentDirection[player] == '') {
			currentDirection[player] = startingDirection[player];
		}
		/*
		 * check outside borders for collision / end game
		 */
	    if(currentDirection[player] == "down") { // move down
	        var currentX = bikeCoord[player].x;
		    if (currentX < (kin.getCanvas().height- bikeCoord[player].height*2 - borderWidth)) { // move down
		        var newX = currentX + linearDistEachFrame;
		        bikeCoord[player].x = newX;
		    } else {
		    	endGame();
		    }
	    } else if(currentDirection[player] == "up") { // move up
	        var currentX = bikeCoord[player].x;
		    if (currentX > 0) { // move down
		        var newX = currentX - linearDistEachFrame;
		        bikeCoord[player].x = newX;
		    } else {
		    	endGame();
		    }
	    } else if(currentDirection[player] == "left") { // move left
	        var currentY = bikeCoord[player].y;
		    if (currentY > 0) { // move down
		        var newY = currentY - linearDistEachFrame;
		        bikeCoord[player].y = newY;
		    } else {
		    	endGame();
		    }
	    } else if(currentDirection[player] == "right") { // move right
	        var currentY = bikeCoord[player].y;
		    if (currentY < (kin.getCanvas().width- bikeCoord[player].height*2 - borderWidth)) { // move down
		        var newY = currentY + linearDistEachFrame;
		        bikeCoord[player].y = newY;
		    } else {
		    	endGame();
		    }
	    }
	    //console.log(currentDirection[player]);
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
function updateBikeHistory(whichBike) {
	var whichBike = "Player1";
	var historyCoord = {x : 0, y: 0, height: 1, width: 1};
	var bikeData = bikeCoord[whichBike];
	//console.log(bikeData);
	
	/**
	 * setup current direction if starting
	 */
	if(currentDirection[whichBike] == '') {
		currentDirection[whichBike] = startingDirection[whichBike];
	}
	
	if(historyDirection[whichBike] != currentDirection[whichBike]) {
		historyCoord.x = bikeData.x + (bikeData.width/2);
		historyCoord.y = bikeData.y + (bikeData.height/2);

		if(historyDirection[whichBike] == "up" && bikeHistory[whichBike][0]) {
			bikeHistory[whichBike][0].x = historyCoord.x;
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

		var historyLength = bikeHistory[whichBike].unshift(historyCoord);
//		console.log(bikeHistory);
		
		historyDirection[whichBike] = currentDirection[whichBike];
		
	}
	
	
    if(historyDirection[whichBike] == "down") { // move down
    	bikeHistory[whichBike][0].height = bikeData.x - bikeHistory[whichBike][0].x;
    
    } else if(historyDirection[whichBike] == "up") { // move up
    	bikeHistory[whichBike][0].x = bikeData.x;
    	/** to calculate width - we need to either have a previous coordinate, or a starting position */
    	if(bikeHistory[whichBike][1]) {
    		bikeHistory[whichBike][0].height = bikeHistory[whichBike][1].x - bikeData.x;
    	} else {
    		bikeHistory[whichBike][0].height = startCoord[whichBike].x - bikeData.x;
    	}

    } else if(historyDirection[whichBike] == "left") { // move left
    	bikeHistory[whichBike][0].y = bikeData.y;
    	/** to calculate width - we need to either have a previous coordinate, or a starting position */
    	if(bikeHistory[whichBike][1]) {
    		bikeHistory[whichBike][0].width = bikeHistory[whichBike][1].y - bikeData.y;
    	} else {
    		bikeHistory[whichBike][0].width = startCoord[whichBike].y - bikeData.y;
    	}
    	
    } else if(historyDirection[whichBike] == "right") { // move right
    	
    	bikeHistory[whichBike][0].width = bikeData.y - bikeHistory[whichBike][0].y;
    
    }

    if(bikeHistory[whichBike]) {
	    if(bikeHistory[whichBike].length > maxBikeLength) {
	    	bikeHistory[whichBike].splice(maxBikeLength,(bikeHistory[whichBike].length-maxBikeLength));
		}
    }
}

/** draw bike **/
function drawBike(bikeId) {
	var context = kin.getContext();
	var bikePosition = bikeCoord[bikeId];
	//console.log(bikeId);
	/** draw history blocks in different colour - then layer bike ontop */
	if(bikeHistory[bikeId]) {
		context.beginPath();
		for ( var int = 0; int < bikeHistory[bikeId].length; int++) {
			var history = bikeHistory[bikeId][int];
			
			//console.log("draw: "+int);
			
		    context.rect(history.y, history.x, history.width, history.height);
		 
		    context.fillStyle = "#ccc";
		    context.fill();
		    context.lineWidth = 2;
		    context.strokeStyle = "red";
		}
	    context.stroke();
	}	
    /*
     * detect collision with a line (lazy detection
     */
//    if(checkCollision(bikePosition.x,bikePosition.y,bikePosition.width,bikePosition.height)) {
//    	endGame();
//    }
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