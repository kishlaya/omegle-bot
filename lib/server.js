function getRandom(m, M) {
	// Returns a random number between m and M (inclusive)
	return m+Math.floor(Math.random()*(M-m+1));
}

module.exports = function(interests) {
	// Select an omegle server at random
	var front = "front" + getRandom(1, 9);	
	var start = "http://" + front + ".omegle.com/start?rcs=1&firstevents=1&lang=en";

	// Allow for interests if provided 
	if(interests.length>0) {
		topics = "[";
		interests.forEach(function(topic) {
			topics += "\"" + topic + "\","
		});
		topics = topics.substring(0, topics.length-1);
		topics += "]";
		start+="&topics="+topics;
	}
	
	return {
		"start": start,
		"base": "http://" + front + ".omegle.com"
	}
}