// The bot will reply using the api from https://api.ai
var agent = require('apiai')(process.env.clientAccessToken);

module.exports = function(bot, eventListener) {

	eventListener.on("waiting", function() {
		console.log("=============");
		console.log("Connecting...");
		console.log("=============");
	});

	// Send a Hello! message as soon as a new user gets connected
	eventListener.on("connected", function() {
		console.log("==================");
		console.log("New User Connected");
		console.log("==================");
		bot.connected = true;
		bot.advancedSend("Hello!");
	});

	eventListener.on("commonLikes", function(data) {
		console.log("==============");
		console.log("Common Likes: " + data);
		console.log("==============");
	});

	eventListener.on("typing", function() {
		console.log("==============");
		console.log("User is typing");
		console.log("==============");
	});

	// Whenever user sends a message, gotMessage will be triggered
	eventListener.on("gotMessage", function(data) {

		console.log("User: " + data);

		// Send the message recieved from the user to the api.ai server
		var request = agent.textRequest(data, {
		    sessionId: 'randomSessionID'
		});

		// api.ai will return a reply, which will be sent back to the user.
		request.on('response', function(response) {
			reply = response.result.fulfillment.speech;
			bot.advancedSend(reply);
		});

		request.on('error', function(err) {
		    console.log(err);
		    throw err;
		});

		request.end();
	});

	eventListener.on("strangerDisconnected", function() {
		console.log("=================");
		console.log("User Disconnected");
		console.log("=================");
		bot.reconnect();
	});

	eventListener.on("timeout", function() {
		console.log("=======");
		console.log("Timeout");
		console.log("=======");
		bot.reconnect();
	});

	eventListener.on("antinudeBanned", function() {
		console.log("===================");
		console.log("Bot has been banned");
		console.log("===================");
		process.exit();
	});

	eventListener.on("recaptchaRequired", function(data) {
		console.log("==================");
		console.log("Captcha Required. \nBot has not yet been programmed to deal with captchas");
		console.log("==================");
		process.exit();
	});

	eventListener.on("error", function(data) {
		console.log("=====");
		console.log("Error");
		console.log("=====");
		bot.reconnect();
	});

	eventListener.on("connectionDied", function(data) {
		console.log("=====");
		console.log("Error");
		console.log("=====");
		bot.reconnect();
	});
}