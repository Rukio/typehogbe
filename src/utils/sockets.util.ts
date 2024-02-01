const heartbeatRaceClients = (WS) => {
	WS.getWss().on("connection", (ws) => {
		ws.isAlive = true;
		ws.send("You are connected to WS!");
	});

	const clients = WS.getWss().clients;

	setInterval(() => {
		clients.forEach((client) => {
			if (client.isAlive === false) return client.terminate();

			client.isAlive = false;
			client.ping();
		});
	}, 10000);
};

module.exports = {
	heartbeatRaceClients,
};

export {};
