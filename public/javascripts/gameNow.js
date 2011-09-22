var state = 'Player1';
var gameId;

$(document).ready(function(){

	now.connectMessage = function(runningState){
	    state = runningState;
	    $("#state").html(state);
	    gameId = $("#gameId").html();
	    now.joinGame(gameId);

	  }
	
	now.returnState = function(runningState){
		runningState = "Player1";
	    state = runningState;
	    
	    $("#state").html(state);
	    if(state == "Player1") {
	        kin.startAnimation();
	        //startCoord = startPos1;
		    //bikeCoord = startCoord;

	    } else if(state == "Player2") {
		    kin.startAnimation();
		    //startCoord = startPos2;
		    //bikeCoord = startCoord;
	    
	    } else if(state == "Spectator") {
	        kin.startAnimation();
	    } 
	    
	  }
	
	now.receiveMove = function(player,newBikeCoord,newCurrentDirection) {
		//currentDirection = newCurrentDirection;
		//bikeCoord = newBikeCoord;
	}
	
});
