var state = 'guest';
var gameId;

$(document).ready(function(){

	now.connectMessage = function(runningState){
	    state = runningState;
	    $("#state").html(state);
	    gameId = $("#gameId").html();
	    now.joinGame(gameId,$("#twitterName").html());

	  }
	
	now.returnState = function(runningState){
		if(state == "Player1" || state == "Player2") {
			return; // this stops multiple callbacks
		}
	    state = runningState;
	    
    	//gameState = "running";
	    
	    console.log("running as :" + state);
	    
	    $("#state").html(state);
	    if(state == "Player1") {
	      //  kin.startAnimation();
	        //startCoord = startPos1;
		    //bikeCoord = startCoord;

	    } else if(state == "Player2") {
		    //kin.startAnimation();
		    //startCoord = startPos2;
		    //bikeCoord = startCoord;
	    
	    } else if(state == "Spectator") {
	        //kin.startAnimation();
	    } 
	    
	}
	
	now.startGame = function(users) {
		var i=0;
		for (id in users) {
			i++;
			twit = users[id];
			$("#p"+i+"Img").attr("src","http://api.twitter.com/1/users/profile_image/"+twit+".json");
			$("#p"+i+"Name").html(twit);
		}
		gameState = "running";
		$("#waiting").hide();
		kin.startAnimation();
	}
	
	
	now.receiveMove = function(player,newBikeCoord,newCurrentDirection) {
		currentDirection[player] = newCurrentDirection;
		bikeCoord[player] = newBikeCoord;
	}
	
});
