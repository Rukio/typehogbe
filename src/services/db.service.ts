const { Client, types } = require("pg");
const { dbConfig } = require("../configs/db.config");

// Converting BIGINT and NUMERIC to numbers
types.setTypeParser(types.builtins.INT8, (value: string) => {
	return parseInt(value);
});

types.setTypeParser(types.builtins.FLOAT8, (value: string) => {
	return parseFloat(value);
});

types.setTypeParser(types.builtins.NUMERIC, (value: string) => {
	return parseFloat(value);
});

const query = async <K> (sql: string, params): Promise<K> => {
	const client = new Client(dbConfig);
	await client.connect();

	try {
		const result: K = await client.query(sql, params);

		return result;
	} finally {
		await client.end();
	}
};

module.exports = {
	query,
};
