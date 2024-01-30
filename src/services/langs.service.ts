import {BodyPayload, GetManyParams, SystemDateTypes, SystemIdType} from "./commonTypes.service";

const db = require("./db.service");
const {
	getSelectQuery,
	getInsertInto,
	getUpdate,
	removeById,
} = require("../utils/service.util");

export interface LangsServiceType extends SystemDateTypes, SystemIdType {
  name: string,
  img: string,
}

const tableName = "langs";

const getMany = async (queryParams: GetManyParams): Promise<LangsServiceType[]> => {
	const { query: selectQuery, values: selectQueryValues } = getSelectQuery({
		tableName,
		...queryParams,
	});
	const data: { rows?: LangsServiceType[] } = await db.query(selectQuery,
		selectQueryValues,
	);

	return data.rows;
};

const create = async (body: BodyPayload) => {
	const { query, values } = getInsertInto({
		tableName,
		data: body,
	});
	const result: { rowCount: number } = await db.query(query, values);

	let message = "Error creating a lang";

	if (result.rowCount) {
		message = "Lang created successfully";
	}

	return { message };
};

const update = async (id: number, body: BodyPayload) => {
	const { query, values } = getUpdate({
		tableName,
		id,
		data: body,
	});

	const result: { rowCount: number } = await db.query(query, values);

	let message = "Error updating a lang";

	if (result.rowCount) {
		message = "Lang updated successfully";
	}

	return { message };
};

const remove = async (id: number) => {
	const result: { rowCount: number } = await removeById(id, tableName);

	let message = "Error deleting a lang";

	if (result.rowCount) {
		message = "Lang deleted successfully";
	}

	return { message };
};

module.exports = {
	getMany,
	create,
	update,
	remove,
};
