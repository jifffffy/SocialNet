var express = require('express');
var http = require('http');
var app = express();
var nodemailer = require('nodemailer');
var MemoryStore = require('connect').session.MemoryStore;
var dbPath = 'mongodb://10.168.122.123:27017/socialnet';
var fs = require('fs');
var events = require('events');

// Create an http server
app.server = http.createServer(app);

// Create an event dispatcher
var eventDispatcher = new events.EventEmitter();
app.addEventListener = function (eventName, callback) {
	eventDispatcher.on(eventName, callback);
};
app.removeEventListener = function (eventName, callback) {
	eventDispatcher.removeListener(eventName, callback);
};
app.triggerEvent = function (eventName, eventOptions) {
	eventDispatcher.emit(eventName, eventOptions);
};

// Create a session store
app.sessionStore = new MemoryStore();

// Import the data layer
var mongoose = require('mongoose');
var config = {
	mail: require('./config/mail')
};

// Import the model
var models = {
	Account: require('./models/Account')(app, config, mongoose, nodemailer)
}

// Configure the application
app.configure(function(){
	app.sessionSecret = 'SocialNet secret key';
	app.set('view engine', 'jade');
	app.use(express.static(__dirname + '/public'));
	app.use(express.limit('1mb'));
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({
		secret: 	app.sessionSecret,
		key: 		'express.sid',
		store: 		app.sessionStore
	}));
	mongoose.connect(dbPath, function onMongooseError(err) {
		if (err) throw err;
	});
});

// Import the routes located in ./routes
fs.readdirSync('routes').forEach(function(file) {
	if (file[0] == '.') return;
	var routeName = file.substr(0, file.indexOf('.'));
	require('./routes/' + routeName)(app, models);
});

// -----
// GET /
// -----
app.get('/', function(req, res){
	res.render("index.jade", {layout: false});
});

// -------------------
// POST /contacts/find
// -------------------
app.post('/contacts/find', function(req, res) {
	var searchStr = req.param('searchStr', null);

	if (null == searchStr) {
		res.send(400);
		return;
	}

	models.Account.findByString(searchStr, function onSearchDone(err, accounts) {
		if (err || accounts.length == 0) {
			res.send(404);
		} else {
			// TODO: Check if these accounts were already contacts
			// if so, mark them as isContact so the views/Contact
			// knows not to add a addButton
			res.send(accounts);
		}
	});
});

// Let the server listen to 8000 (instead of the app)
app.server.listen(8000);
console.log('SocialNet listening to port 8000');