import {
	BodyPayload,
	GetManyParams,
	SystemDateTypes,
	SystemIdType,
	MessageResponse,
} from "./commonTypes.service";

const db = require("./db.service");
const {
	getSelectQuery,
	getInsertInto,
	getUpdate,
	removeById,
} = require("../utils/service.util");

export interface ScoresServiceType extends SystemDateTypes, SystemIdType {
  paragraph_id: number,
	user_id: number,
	race_id: number,
	speed: number,
	timings: number[],
}

const tableName = "scores";

const getMany = async (queryParams: GetManyParams): Promise<ScoresServiceType[]> => {
	const { query: selectQuery, values: selectQueryValues } = getSelectQuery({
		tableName,
		...queryParams,
	});
	const data: { rows?: ScoresServiceType[] } = await db.query(selectQuery,
		selectQueryValues,
	);

	return data.rows;
};

const create = async (body: BodyPayload): MessageResponse => {
	const { query, values } = getInsertInto({
		tableName,
		returnId: true,
		data: body,
	});
	const result: { rowCount: number, rows: { id: string }[] } = await db.query(query, values);

	let message = "Error creating a score";

	if (result.rowCount) {
		message = "Score created successfully";
	}

	const resultRows = result.rows;

	return { message, data: { id: resultRows?.[0]?.id} };
};

const update = async (id: number, body: BodyPayload): MessageResponse => {
	const { query, values } = getUpdate({
		tableName,
		id,
		data: body,
	});

	const result: { rowCount: number } = await db.query(query, values);

	let message = "Error updating a score";

	if (result.rowCount) {
		message = "Score updated successfully";
	}

	return { message };
};

const remove = async (id: number): MessageResponse => {
	const result: { rowCount: number } = await removeById(id, tableName);

	let message = "Error deleting a score";

	if (result.rowCount) {
		message = "Score deleted successfully";
	}

	return { message };
};

module.exports = {
	getMany,
	create,
	update,
	remove,
};
