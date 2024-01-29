type ErrorUtilInfo = Record<string, unknown>;
export type ErrorUtilValue = {
  code: number;
  message: string;
	info?: ErrorUtilInfo;
}

module.exports = {
	unauthorized: (message: string, info?: ErrorUtilInfo): ErrorUtilValue => ({
		code: 400,
		message,
		info,
	}),
	badRequest: (message: string, info?: ErrorUtilInfo): ErrorUtilValue => ({
		code: 401,
		message,
		info,
	}),
	notFound: (message: string, info?: ErrorUtilInfo): ErrorUtilValue => ({
		code: 404,
		message,
		info,
	}),
	serverError: (message: string, info?: ErrorUtilInfo): ErrorUtilValue => ({
		code: 500,
		message,
		info,
	}),
};
