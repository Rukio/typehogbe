import {RacesServiceType} from "./services/races.service";

const cron = require("node-cron");
const raceService = require("./services/races.service");

const cronHeartbeatRaceClients = (WS) => {
	WS.getWss().on("connection", (ws) => {
		ws.isAlive = true;
		ws.send("You are connected to WS!");
	});

	const clients = WS.getWss().clients;

	cron.schedule("*/10 * * * * *", () => {
		clients.forEach((client) => {
			if (client.isAlive === false) return client.terminate();

			client.isAlive = false;
			client.ping();
		});
	});
};

// Close races that were created more than 10 minutes ago
const cronCloseActiveRaces = () => {
	cron.schedule("*/10 * * * *", async () => {
		let races: RacesServiceType[] | null = null;

		try {
			races = await raceService.getMany({
				filter: {
					active: "true",
					created_at: `<${Date.now() - 60 * 1000}`,
				},
				returning: ["id", "created_at"],
			});
		} catch (err) {
			console.log("Error getting races for cleanup", err);
		}

		try {
			await Promise.all(
				races.map(({id}) => raceService.update(id, {
					active: false,
					queueable: false,
				})),
			);
		} catch (err) {
			console.log("Error changing race to inactive", err);
		}
	});
};

module.exports = {
	cronHeartbeatRaceClients,
	cronCloseActiveRaces,
};

export {};
