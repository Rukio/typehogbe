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
} = require("../utils/service.util");

export interface UserRaceServiceType extends SystemDateTypes, SystemIdType {
  user_id: number,
	race_id: number,
}

const tableName = "user_race";

const getMany = async (queryParams: GetManyParams): Promise<UserRaceServiceType[]> => {
	const { query: selectQuery, values: selectQueryValues } = getSelectQuery({
		tableName,
		...queryParams,
	});
	const data: { rows?: UserRaceServiceType[] } = await db.query(selectQuery,
		selectQueryValues,
	);

	return data.rows;
};

const create = async (body: BodyPayload): MessageResponse => {
	const { query, values } = getInsertInto({
		tableName,
		data: body,
	});
	const result: { rowCount: number } = await db.query(query, values);

	let message = "Error creating a user to race link";

	if (result.rowCount) {
		message = "User to race link created successfully";
	}

	return { message };
};

const update = async (id: number, body: BodyPayload): MessageResponse => {
	const { query, values } = getUpdate({
		tableName,
		id,
		data: body,
	});

	const result: { rowCount: number } = await db.query(query, values);

	let message = "Error updating a user to race link";

	if (result.rowCount) {
		message = "User to race link updated successfully";
	}

	return { message };
};

const remove = async (id: number): MessageResponse => {
	const result: { rowCount: number } = await db.query(
		`DELETE FROM ${tableName} WHERE id=$1`,
		[id],
	);

	let message = "Error deleting a user to race link";

	if (result.rowCount) {
		message = "User to race link deleted successfully";
	}

	return { message };
};

module.exports = {
	getMany,
	create,
	update,
	remove,
};
