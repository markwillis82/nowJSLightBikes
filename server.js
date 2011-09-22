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

// Routes

/** game page **/
app.get('/game/:gameId/', function(req, res){
	var gameId = req.params.gameId;
	
	var gameIndex = waitingGames.indexOf(gameId);
	
	if(gameIndex != -1) {
		/** move game from pending to running */
		waitingGames.splice(gameIndex,1);
		runningGames.push(gameId);
		
	} else {
		/** push game onto waiting list */
		waitingGames.push(gameId);
		stats[gameId] = [];
		//everyone.now.updateWaiting(gameId);
	}
	
	
	  res.render('game', {
	    title: 'Light Bikes - game: '+ gameId,
	    gameId: gameId
	  });
	
	nowjs.on('connect', function () {
		  this.now.connectMessage('Loading: ' + this.user.clientId);
	});

});


/** start page **/
app.get('/', function(req, res){
	  res.render('index', {
	    title: 'Light Bikes',
	    waitingGames: waitingGames,
	    runningGames: runningGames
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


/**
 * clever - aSync nowJS parts
 */

everyone.now.joinGame = function(gameId){
	
	/*if(stats[gameId].length > 2) {
		var state = "Spectator";
	
	} else if(stats[gameId].length == 1) {
		var state = "Player2";
		stats[gameId].push(this.user.clientId);
	
	} else if(stats[gameId].length == 0) { */
		var state = "Player1";
		stats[gameId].push(this.user.clientId);
	//}
	var gameGroup = nowjs.getGroup(gameId);
	gameGroup.addUser(this.user.clientId);
	
	this.now.returnState(state);
};

everyone.now.sendMove = function(gameId,player,bikeCoord,currentDirection) {
	var gameGroup = nowjs.getGroup(gameId);
	gameGroup.exclude(this.user.clientId).now.receiveMove(player,bikeCoord,currentDirection);
}




app.listen(9999);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);


function uniqId() {
	var newDate = new Date;
	return newDate.getTime()+(Math.random()*10);
}
