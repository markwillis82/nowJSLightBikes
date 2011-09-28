/* 
 * var setup
 */
var waitingGames = [];
var runningGames = [];
var stats = [];


/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();


var nowjs = require("now");


var nowOptions = {
//	  socketio : {'transports': ['xhr-polling']}   // This is the options object passed into io.listen(port, options)
	};


var everyone = nowjs.initialize(app,nowOptions);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'Chase' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// oAuth setup
var OAuth= require('oauth').OAuth;
var oa = new OAuth(
	"https://api.twitter.com/oauth/request_token",
	"https://api.twitter.com/oauth/access_token",
	"9i4da04eWdh3tQPh9K8Tw",
	"76rC8ogZ70khB4Vh0BVm73qfK68DwZxGMzFs650TJwI",
	"1.0",
	"http://192.168.10.97:9999/auth/twitter/callback",
	"HMAC-SHA1"
);




// Routes

/** game page **/
app.get('/game/:gameId/', function(req, res){
	var twitterId = 0;
	var twitterName = '';
	var gameId = req.params.gameId;
	if(req.session.twitter) {
		twitterId = req.session.twitter.user_id;
		twitterName = req.session.twitter.screen_name;
		
		
		var gameIndex = waitingGames.indexOf(gameId);
		
		if(gameIndex != -1) {
			/** move game from pending to running */
			waitingGames.splice(gameIndex,1);
			runningGames.push(gameId);
			console.log("\tGame Started: "+gameId);
			
		} else {
			/** push game onto waiting list */
			waitingGames.push(gameId);
			stats[gameId] = [];
			//everyone.now.updateWaiting(gameId);
			console.log("\tGame Waiting: "+gameId);
		}
		
	} else {
		// we don't start the game for non-signed in users
		req.session.gameId = gameId;

	}
	
	  res.render('game', {
	    title: 'Light Bikes - game: '+ gameId,
	    gameId: gameId,
	    twitterId: twitterId,
	    twitterName: twitterName
	  });
	
	nowjs.on('connect', function () {
		  this.now.connectMessage('Loading: ' + this.user.clientId);
	});


});


/** start page **/
app.get('/', function(req, res){
	var twitterId = 0;
	var twitterName = '';
	if(req.session.twitter) {
		twitterId = req.session.twitter.user_id;
		twitterName = req.session.twitter.screen_name;
	}
	
	  res.render('index', {
	    title: 'Light Bikes',
	    waitingGames: waitingGames,
	    runningGames: runningGames,
	    twitterId: twitterId,
	    twitterName: twitterName
	  });
	});


/** join game **/
app.post('/join', function(req, res){
	if(req.param("game")) {
		var gameId = req.param("game");
	} else {
		var gameId = uniqId();
	}

	req.session.gameId = gameId;
	
  res.render('join', {
	title: 'Light Bikes',
    gameId: req.session.gameId
  });
});


app.get('/auth/twitter', function(req, res){
	oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
	  if (error) {
			console.log(error);
			res.send("yeah no. didn't work.")
		}
	  else {
			req.session.oauth = {};
	    req.session.oauth.token = oauth_token;
			//console.log('oauth.token: ' + req.session.oauth.token);
	    req.session.oauth.token_secret = oauth_token_secret;
			//console.log('oauth.token_secret: ' + req.session.oauth.token_secret);
	    res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token)
	  }
	});
});

app.get('/auth/twitter/callback', function(req, res, next){
	  if (req.session.oauth) {
	    req.session.oauth.verifier = req.query.oauth_verifier;
	    var oauth = req.session.oauth;

	    oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier, 
	      function(error, oauth_access_token, oauth_access_token_secret, results){
	        if (error){
						console.log(error);
						res.send("yeah something broke.");
					} else {
						req.session.oauth.access_token = oauth_access_token;
						req.session.oauth,access_token_secret = oauth_access_token_secret;
						req.session.twitter = results;
	        	console.log(results);
	        	console.log(req.session);
	        			if(req.session.gameId) {
	        				res.redirect("/game/"+req.session.gameId+"/");
	        			} else {
	        				res.redirect('/');
	        			}
						
					}
	    	}
	  	);
		} else
	  	next(new Error("you're not supposed to be here."))
});

/**
 * clever - aSync nowJS parts
 */

everyone.now.joinGame = function(gameId,twitterName){
	
	/**
	 * detect if user is already in the game - if so, return there state
	 */
	var currentPos = -1;//stats[gameId].indexOf(twitterName);
	if(currentPos == -1) {
		if(stats[gameId].length > 2) {
			var state = "Spectator";
			console.log("\t\t\tAdding Spectator: "+gameId);
		
		} else if(stats[gameId].length == 1) {
			var state = "Player2";
			stats[gameId].push(twitterName);
			console.log("\t\t\tAdding Player2: "+gameId);
		
		} else if(stats[gameId].length == 0) { 
			var state = "Player1";
			stats[gameId].push(twitterName);
			console.log("\t\t\tAdding Player1: "+gameId);
	
		}
	} else if (currentPos == 0) { // they are player 1
		var state = "Player1";
		console.log("\t\t\tPlayer1 Rejoin");
		
	} else if (currentPos == 1) { // they are player 2
		var state = "Player2";
		console.log("\t\t\tPlayer2 Rejoin");
	
	} else { // they are a spectator
		var state = "Spectator";
		console.log("\t\t\tSpectator Rejoin");
	
	}
	var gameGroup = nowjs.getGroup(gameId);
	gameGroup.addUser(this.user.clientId);
	
	this.now.returnState(state,stats[gameId]);

	if(stats[gameId].length == 2) {
		var gameGroup = nowjs.getGroup(gameId);
		console.log("\t\tStarting Game: "+ gameId);
		gameGroup.now.startGame(stats[gameId]);
	}

};

everyone.now.sendMove = function(gameId,player,bikeCoord,currentDirection,prevHistory) {
	var gameGroup = nowjs.getGroup(gameId);
	console.log("\t\tSending Move: "+ gameId + " - p:"+player + " - "+ currentDirection);
	gameGroup.exclude(this.user.clientId).now.receiveMove(player,bikeCoord,currentDirection,prevHistory);
}

everyone.now.sendEnd = function(gameId) {
	var gameGroup = nowjs.getGroup(gameId);
	console.log("\t\tGame Ended: "+ gameId);
	gameGroup.now.finishGame();
	delete stats[gameId];
	//nowjs.groupDel(gameId);
}

nowjs.on('disconnect', function () {
	/**
	 * we need to remove this user from any games/groups and update spectator lists
	 */
});



app.listen(9999);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);


function uniqId() {
	var newDate = new Date;
	return newDate.getTime()+(Math.random()*10);
}
