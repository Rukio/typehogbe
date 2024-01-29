require("dotenv").config();

const env = process.env;

module.exports = {
	dbConfig: {
		host: env.DB_HOST,
		user: env.DB_USER,
		port: env.DB_PORT,
		password: env.DB_PASSWORD,
		database: env.DB_NAME,
	},
	ACCESS_TOKEN_SECRET: env.ACCESS_TOKEN_SECRET,
	REFRESH_TOKEN_SECRET: env.ACCESS_TOKEN_SECRET,
};
