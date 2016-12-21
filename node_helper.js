/* Magic Mirror
 * Node Helper: MMM-PVoutput
 *
 * By Martin van Es
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var request = require('request');

module.exports = NodeHelper.create({
	// Override start method.
	start: function() {
		console.log("Starting node helper for: " + this.name);
		return;
	},

	// Override socketNotificationReceived method.
	socketNotificationReceived: function(notification, payload) {
		self = this;
		this.sid = payload.sid;
		this.apiKey = payload.apiKey;
		this.url = "http://pvoutput.org/service/r2/getstatus.jsp";
		
		// Do some stuff with API url
		setInterval(function() {
			self.getData(self)
		}, payload.updateInterval);
		
		this.getData(this);
		return;
	},

	getData: function(self) {
		var options = {
			url: self.url,
			headers: {
				'X-Pvoutput-SystemId': self.sid,
				'X-Pvoutput-Apikey': self.apiKey,
			},
			qs: {
				h: 1,
				asc: 1,
				limit: 1000,
			},
		}

 		request(options, function(error, response, body) {
			self.processData(error, response, body, self);
		});
		
	},
	

	processData: function(error, response, body, self) {
		if (error) {
			self.sendSocketNotification("ERROR", {
				error: "Error",
			});
			return;
		}
		
		if (response.statusCode != 200) {
			self.sendSocketNotification("ERROR", {
				error: body,
			});
			return;
		}

		var Gp = [];
		var Cp = [];
		var curGp = 0;
		var curGe = 0;
		
		var lines = body.split(';');
		for(var i = 0;i < lines.length;i++){
			var values = lines[i].split(',');
			Gp.push(values[4]=="NaN"?0:values[4]);
			Cp.push(values[8]=="NaN"?0:values[8]);
			curGp = values[4]=="NaN"?0:values[4];
			curGe = values[2]=="NaN"?0:values[2];
		}

		self.sendSocketNotification("NEW_DATA", {
			Gp: Gp,
			Cp: Cp,
			curGp: curGp,
			curGe: curGe,
		});
	},
});
