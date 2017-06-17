// Event Emitter for listening/emitting omegle events
var events = require('events');
var omegleEvents = require('./lib/omegle-events.js');
var eventEmitter = new events.EventEmitter();

// Omegle controller
var omegle = require('./lib/controller.js');

// Default parameters
var timeout = 300; // Timeout in seconds
var interests = ["cooking", "painting", "dancing", "singing"]; // Comma-separated list of interests

// Set up an omegle bot
var bot = new omegle(timeout, interests, eventEmitter);

// Initiate a new connection
bot.connect();

// Listen to events
omegleEvents(bot, eventEmitter);