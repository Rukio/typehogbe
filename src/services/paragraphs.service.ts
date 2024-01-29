import {
	BodyPayload,
	GetManyParams,
	MessageResponse,
	SystemDateTypes,
	SystemIdType,
} from "./commonTypes.service";

const db = require("./db.service");
const {
	getSelectQuery,
	getInsertInto,
	getUpdate,
} = require("../utils/service.util");

export interface ParagraphsServiceType extends SystemDateTypes, SystemIdType {
  title: string,
  text: string,
	source_id: number,
	lang_id: number,
}

const tableName = "paragraphs";

const getMany = async (queryParams: GetManyParams): Promise<ParagraphsServiceType[]> => {
	const { query: selectQuery, values: selectQueryValues } = getSelectQuery({
		tableName,
		...queryParams,
	});
	const data: { rows?: ParagraphsServiceType[] } = await db.query(selectQuery,
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

	let message = "Error creating a paragraph";

	if (result.rowCount) {
		message = "Paragraph created successfully";
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

	let message = "Error updating a paragraph";

	if (result.rowCount) {
		message = "Paragraph updated successfully";
	}

	return { message };
};

const remove = async (id: number): MessageResponse => {
	const result: { rowCount: number } = await db.query(
		`DELETE FROM ${tableName} WHERE id=$1`,
		[id],
	);

	let message = "Error deleting a paragraph";

	if (result.rowCount) {
		message = "Paragraph deleted successfully";
	}

	return { message };
};

module.exports = {
	getMany,
	create,
	update,
	remove,
};

export {};
