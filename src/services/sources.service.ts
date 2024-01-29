import {BodyPayload, GetManyParams, SystemDateTypes, SystemIdType} from "./commonTypes.service";

const db = require("./db.service");
const {
	getSelectQuery,
	getInsertInto,
	getUpdate,
} = require("../utils/service.util");

export interface SourcesServiceType extends SystemDateTypes, SystemIdType {
  title: string,
  author: string,
	img: string,
}

const tableName = "sources";

const getMany = async (queryParams: GetManyParams): Promise<SourcesServiceType[]> => {
	const { query: selectQuery, values: selectQueryValues } = getSelectQuery({
		tableName,
		...queryParams,
	});
	const data: { rows?: SourcesServiceType[] } = await db.query(selectQuery,
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

	let message = "Error creating a source";

	if (result.rowCount) {
		message = "Source created successfully";
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

	let message = "Error updating a source";

	if (result.rowCount) {
		message = "Source updated successfully";
	}

	return { message };
};

const remove = async (id: number) => {
	const result: { rowCount: number } = await db.query(
		`DELETE FROM ${tableName} WHERE id=$1`,
		[id],
	);

	let message = "Error deleting a source";

	if (result.rowCount) {
		message = "Source deleted successfully";
	}

	return { message };
};

module.exports = {
	getMany,
	create,
	update,
	remove,
};
