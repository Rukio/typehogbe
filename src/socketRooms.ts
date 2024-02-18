const rooms: {
	[uuid: string]: {
		[id: number | string]: unknown
	}
} = {};

const join = (roomUuid: string, userId: number | string, userWs) => {
	// Leave a previous room before joining to a new one
	for (const room in rooms) {
		if (rooms[room][userId]) {
			delete rooms[room][userId];
		}
	}

	if (!rooms[roomUuid]) rooms[roomUuid] = {};
	rooms[roomUuid][userId] = userWs;
	console.log(`Joined room ${roomUuid} as ${userId}`);
};

const leave = (roomUuid: string, userId: number | string) => {
	if (!rooms[roomUuid]?.[userId]) {
		return;
	}

	delete rooms[roomUuid][userId];

	setTimeout(() => {
		if (!Object.keys(rooms[roomUuid]).length) {
			delete rooms[roomUuid];
		}
	}, 10000);
};

module.exports = {
	rooms,
	join,
	leave,
};

