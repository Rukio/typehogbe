import {BodyPayload, GetManyParams, SystemDateTypes, SystemIdType} from "./commonTypes.service";

const db = require("./db.service");
const {
	getSelectQuery,
	getInsertInto,
	getUpdate,
} = require("../utils/service.util");

export interface UsersServiceType extends SystemDateTypes, SystemIdType {
  name: string,
	email: string,
	country: string,
  img: string,
	regdate: number,
	role_id: number,
}

const tableName = "users";

const getOneBy = async (field: string, value: string | number): Promise<UsersServiceType | null> => {
	const { query: selectQuery, values: selectQueryValues } = getSelectQuery({
		tableName,
		filter: {
			[field]: String(value),
		},
	});

	const data: { rows?: UsersServiceType[] } = await db.query(selectQuery,
		selectQueryValues,
	);

	return data.rows?.[0] || null;
};

const getMany = async (queryParams: GetManyParams): Promise<UsersServiceType[]> => {
	const { query: selectQuery, values: selectQueryValues } = getSelectQuery({
		tableName,
		...queryParams,
	});
	const data: { rows?: UsersServiceType[] } = await db.query(selectQuery,
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

	let message = "Error creating a user";

	if (result.rowCount) {
		message = "User created successfully";
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

	let message = "Error updating a user";

	if (result.rowCount) {
		message = "User updated successfully";
	}

	return { message };
};

const remove = async (id: number) => {
	const result: { rowCount: number } = await db.query(
		`DELETE FROM ${tableName} WHERE id=$1`,
		[id],
	);

	let message = "Error deleting a user";

	if (result.rowCount) {
		message = "User deleted successfully";
	}

	return { message };
};

module.exports = {
	getOneBy,
	getMany,
	create,
	update,
	remove,
};

export {};
