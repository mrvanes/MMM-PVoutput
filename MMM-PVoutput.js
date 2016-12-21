/* global Module */

/* Magic Mirror
 * Module: MMM-PVoutput
 *
 * By Martin van Es
 * MIT Licensed.
 */

Module.register("MMM-PVoutput",{
	// Define module defaults
	defaults: {
		width: 500,
		height: 300,
		lineWidth: 2,
		showConsumption: false,
		genLineColor: "#e0ffe0",
		genFillColor: "rgba(100, 200, 100, 0.2)",
		consLineColor: "#ffe0e0",
		consFillColor: "rgba(200, 100, 100, 0.2)",
		updateInterval: 300000,
		maxPower: 2000,
	},
	
	// Override start method.
	start: function() {
		Log.log("Starting module: " + this.name);
		this.payload = false;
		
		this.sendSocketNotification("ADD_SYSTEM_ID", {
			sid: this.config.sid,
			apiKey: this.config.apiKey,
			updateInterval: this.config.updateInterval,
		});

	},
	
	// Define required scripts.
	getScripts: function() {
		return ["http://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js", "jquery.sparkline.min.js"];
	},

	// Override socket notification handler.
	socketNotificationReceived: function(notification, payload) {
		if (notification == "ERROR") {
			$("#curGe").html("");
			$("#curGp").html("");
			$("#sparkline").html(payload.error);
			return;
		}

		$("#sparkline").sparkline(
			payload.Gp, {
			type: 'line',
			width: this.config.width,
			height: this.config.height,
			lineColor: this.config.genLineColor,
			fillColor: this.config.genFillColor,
			spotColor: false,
			minSpotColor: false,
			maxSpotColor: false,
			lineWidth: this.config.lineWidth,
			chartRangeMin: 0,
			chartRangeMax: this.config.maxPower,
		});

		if (this.config.showConsumption) {
			$("#sparkline").sparkline(
				payload.Cp, {
				composite: true,
				lineColor: "#ffe0e0",
				fillColor: "rgba(200,100,100,0.2)",
				spotColor: false,
				minSpotColor: false,
				maxSpotColor: false,
				lineWidth: this.config.lineWidth,
				chartRangeMin: 0,
				chartRangeMax: this.config.maxPower,
			});
		};

		$("#curGe").html((payload.curGe/1000).toFixed(1) + "kWh");
		$("#curGp").html(payload.curGp + "W");

	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("table");
		wrapper.align = "center";
		wrapper.style.cssText = "width: " + this.config.width + "px";
		var currentRow = document.createElement("tr");
		var curGe = document.createElement("td");
		curGe.id = "curGe";
		currentRow.appendChild(curGe);
		var curGp = document.createElement("td");
		curGp.id = "curGp";
		currentRow.appendChild(curGp);
		wrapper.appendChild(currentRow);

		var graphRow = document.createElement("tr");
		var graph = document.createElement("td");
		graph.colSpan = 2;
		graph.id = "sparkline";
		graph.innerHTML = "No Data";
		graphRow.appendChild(graph);
		wrapper.appendChild(graphRow);

		return wrapper;
	}
});

