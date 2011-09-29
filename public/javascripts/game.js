var kin;
var canvasWidth = 800;
var canvasHeight = 500;
var borderWidth = 10;
var gameState = "waiting";
var autoPlayer1Timer = false;
var finishGame = false;
var bikeSize = 2;
/**
 * slight whoopsie - X = y and Y = x
 */

var bikeCoord = {};
	bikeCoord["Player1"] = ({x : 400, y: 400, height: bikeSize, width: bikeSize});
	bikeCoord["Player2"] = {x : 400, y: 400, height: bikeSize, width: bikeSize};

//var startPos1 = {x : 400, y: 200, height: 10, width: 10};
//var startPos2 = {x : 400, y: 700, height: 10, width: 10};
var startCoord = {};
	startCoord["Player1"] = {x : 400, y: 200, height: bikeSize, width: bikeSize};
	startCoord["Player2"] = {x : 400, y: 700, height: bikeSize, width: bikeSize};

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


function autoPlayer1() {
	if(currentDirection["Player1"] == "up") {
		newDir = 68;
	} else if(currentDirection["Player1"] == "left") { 
		newDir = 87;
	} else if(currentDirection["Player1"] == "down") { 
		newDir = 65;
	} else if(currentDirection["Player1"] == "right") { 
		newDir = 83;
	}	
	changeDirection('Player1',newDir);
}
	
	
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
//				console.log("No Fire");
			}
		}

	
	 kin = new Kinetic_2d("gameMap");
    
    currentDirection = startingDirection;

    // set drawStage method
    kin.setDrawStage(function(){
    	if(gameState == "running") {
    		/**
    		 * make Player1 auto
    		 */
    	    if(!autoPlayer1Timer) {
    	    	autoPlayer1Timer = setInterval('autoPlayer1()', 1000);
    		}
    		
	        kin.clear();
	        drawBoundingBox();
	        if(kin.isAnimating()) {
				updateBikeHistory("Player1");
				updateBikeHistory("Player2");
		    	updateStage();
		        showFPS();
		        var context = kin.getContext();
			    	drawBike("Player1");
			    	drawBike("Player2");
	        }	
		    if(finishGame) {
	        	drawCollision();
	        }
	        
		    	
    	} else/*if(gameState == "waiting") */{
    		drawWait();
    	}
    });

});

function showFPS() {
    var context = kin.getContext();
	context.font = "8pt Calibri";
    context.fillText("fps: "+kin.getFps(), 10, 10);
}

function drawWait() {
    var context = kin.getContext();
	context.font = "24pt Calibri";
    context.fillText("Waiting for players", 20, 20);
}

function drawCollision() {
//	console.log(bikePosition);
    var context = kin.getContext();
	context.font = "24pt Calibri";
    context.fillText("Collision", 20, 20);
    finishGame = false;
    //now.sendEnd(gameId);
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
	if(state == bikeState) {
		now.sendMove(gameId,bikeState,bikeCoord[bikeState],currentDirection[bikeState],bikeHistory[bikeState]);
	}
}

/** update stage - new coord */
function updateStage() {
	var linearDistEachFrame = bikeSpeed * kin.getTimeInterval() / 1000;
	
	//playerNames = {names:"Player1", "Player2"};
	var playerNames =  ["Player1", "Player2"]

	for (var playerPos in playerNames)	{
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
	
	if(autoPlayer1Timer) {
		clearTimeout(autoPlayer1Timer);
	}
}


/** update previous bike positions - limit **/
function updateBikeHistory(whichBike) {
	//var whichBike = "Player1";
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
	if(!bikeCoord[bikeId]) {
		return false;
	}
	var context = kin.getContext();
	var bikePosition = bikeCoord[bikeId];
	//console.log(bikeId);
	/** draw history blocks in different colour - then layer bike ontop */
	
	if(bikeHistory[bikeId]) {
		
		/** the last line in the path should be green - this allows for collision detection to look for red or blue */
		var historyLength = bikeHistory[bikeId].length;
		context.beginPath();
		for ( var int = 0; int < bikeHistory[bikeId].length; int++) {
			var history = bikeHistory[bikeId][int];
			
			//console.log("draw: "+int);
			
		    context.rect(history.y, history.x, history.width, history.height);
		 
		    context.fillStyle = "#ccc";
		    context.fill();
		    context.lineWidth = 2;
//		    console.log(int + " - " + (historyLength-1));
		    /**
		     * on the last element of the history - check for collision before drawing the line
		     */
		    if(int == (historyLength - 3)) {
//		    	context.strokeStyle = "#00FF00";
		        /*
		         * detect collision with a line (lazy detection)
		         */
		    	var col = checkCollision(bikePosition.y,bikePosition.x,bikePosition.width,bikePosition.height,bikeId);
		        if(col) {
		        	if(col != bikeId) {
			        	console.log(col + " -- " + bikeId);
			        	finishGame = true;
		        	}
		        	
		        }
		    	
		    }
		    if(bikeId == "Player1") {
		    	context.strokeStyle = "#FF0000";
		    } else {
		    	context.strokeStyle = "#0000FF";
		    }
		    context.stroke();
		}
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
function checkCollision(x,y,width,height,ignoreBike) {
	var context = kin.getContext();
	var imgd = context.getImageData(x, y, width, height);
	var pix = imgd.data;
	for (var i = 0; n = pix.length, i < n; i += 4) {
//		console.log(pix[i]);
		if (pix[i] != 0) {
			if(ignoreBike == "Player1") {
				return false;
			}
			//console.log("col: "+ignore);
//			console.log(pix[i]);
			return ignoreBike;
		} else if (pix[i+1] != 0) {
//			console.log(pix[i]);
			//return true;
			return false;
		} else if (pix[i+2] != 0) {
			if(ignoreBike == "Player2") {
				return false;
			}

			//console.log("col2: "+ignore);
//			console.log(pix[i]);
			return ignoreBike;
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
	context.fillStyle = "black";
    context.fill();
    
    context.lineWidth = 5;
    context.strokeStyle = 'red';
    context.stroke();
    context.fillStyle = "white";
}