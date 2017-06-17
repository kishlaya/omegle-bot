var request = require('request');
var getServer = require('./server.js');

// Timer for polling to the /events page
var timer = {};

var omegle = function(myTimeout, myInterests, myListener) {
	// Stores the omegle server address
	this.url;

	// Stores the unique client ID returned by omegle, for each particular session
	this.cid;

	// If the bot is connected to a user or not
	this.connected = false;

	// Time elapsed since the user last responded
	this.timeLastResponse = 0;

	// Idle time to be spent before disconecting
	this.timeout = myTimeout;

	// Interests (omegle parameter)
	this.interests = myInterests;

	// Event listener
	this.listener = myListener;
	return this;
}

omegle.prototype.connect = function() {
	var client = this;

	if(client.connected)
		return;

	// Get omegle server
	client.url = getServer(client.interests);
	
	// Initiate the connection
	request.get(client.url.start, function(err, res, data) {
		if(err) {
			console.log(err);
			throw err;
		}

		if(data == "null" || data == "{}") {
			client.connect();
			return;
		}

		data = JSON.parse(data);
		client.cid = data.clientID;
		readEvents(data.events, client);

		timer = setInterval(function() {
			getEvents(client);
		}, 1000);
	});
};

omegle.prototype.disconnect = function() {
	var client = this;

	if(!client.connected)
		return;

	// Reset the connection parameters
	reset(client);

	// Initiate the disconnection
	request.get({
		"url": client.url.base + '/disconnect',
		"form": {
			"id": client.cid
		}
	}, function(err, res, data) {
		if(err) {
			console.log(err);
			throw err;
		}
	});
};

omegle.prototype.reconnect = function() {
	var client = this;

	if(!client.connected) {
		reset(client);
		client.connect();
		return;
	}

	// Reset the connection parameters
	reset(client);

	// Initiate the disconnection
	request.get({
		"url": client.url.base + '/disconnect',
		"form": {
			"id": client.cid
		}
	}, function(err, res, data) {
		if(err) {
			console.log(err);
			throw err;
		}

		// Initiate a new connection after successfully disconnecting
		client.connect();
	});
};

omegle.prototype.send = function(msg) {
	var client = this;

	if(!client.connected)
		return;

	// Sends a message to the connected user
	request.post({
		"url": client.url.base + "/send",
		"form": {
			"msg": msg.toString(),
			"id": client.cid
		}
	}, function(err, res, data) {
		if(err) {
			console.log(err);
			throw err;
		}
		console.log("Bot: " + msg);
	});
};

omegle.prototype.advancedSend = function(msg) {
	var client = this;

	if(!client.connected)
		return;
	
	// The advancedSend() function first imitates as if the bot is typing a message, so as to make the bot look more real.
	// Next, the required message is sent to the user and the stoppedTyping event is trigered.

	// Initiate typing
	request.post({
		"url": client.url.base + "/typing",
		"form": {
			"id": client.cid
		}
	}, function(err, res, data) {
		if(err) {
			console.log(err);
			throw err;
		}

		// Send the required message to the user
		request.post({
			"url": client.url.base + "/send",
			"form": {
				"msg": msg.toString(),
				"id": client.cid
			}
		}, function(err, res, data) {
			if(err) {
				console.log(err);
				throw err;
			}

			console.log("Bot: " + msg);

			// Stop typing
			request.post({
				"url": client.url.base + "/stoppedtyping",
				"form": {
					"id": client.cid
				}
			}, function(err, res, data) {
				if(err) {
					console.log(err);
					throw err;
				}
			});
		});
	});
};

module.exports = omegle;

// Listening to events
function getEvents(client) {
	// Check for timeout
	if(client.timeLastResponse >= client.timeout && client.connected) {
		client.listener.emit('timeout');
		return;
	}

	// The /events page returns the latest event emitted
	request.post({
		"url": client.url.base + "/events",
		"form": {
			"id": client.cid
		}
	}, function(err, res, data) {
		if(err) {
			console.log(err);
			throw err;
		}

		if(data!="null") {
			data = JSON.parse(data);
			readEvents(data, client);
			client.timeLastResponse = 0;
		}
		
		client.timeLastResponse += 1;
	});
}

function readEvents(data, client) {
	// Read the events emitted by the omegle server
	for(i=0;i<data.length;i++)
		if(data[i].length == 1)
			client.listener.emit(data[i][0]);
		else
			client.listener.emit(data[i][0], data[i][1]);
}

function reset(client) {
	// Reset the connection parameters
	client.connected = false;
	client.timeLastResponse = 0;
	clearInterval(timer);
	timer = {};
}