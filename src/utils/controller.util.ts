import {GetManyParams} from "../services/commonTypes.service";
import {validationResult} from "express-validator";

const { badRequest } = require("../utils/errors.util");

type GetControllerToServiceFilterType = {
  page: string;
  limit: string;
  orderBy: GetManyParams["order"]["field"];
  sort: GetManyParams["order"]["direction"];
  [key: string]: string;
};

const getControllerToServiceFilter = (
	{ page, limit, orderBy, sort, ...filterFields }: GetControllerToServiceFilterType,
): GetManyParams => {
	const result: GetManyParams = {
		filter: filterFields,
	};

	if (page && limit) {
		result.pagination = {
			page: Number(page),
			limit: Number(limit),
		};
	}

	if (orderBy) {
		result.order = {
			field: orderBy,
		};

		if (sort) {
			result.order.direction = sort;
		}
	}

	return result;
};

const checkFormErrors = (message, req, next): (() => void) | null => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return () => next(badRequest(message, errors));
	}

	return null;
};

module.exports = {
	getControllerToServiceFilter,
	checkFormErrors,
};
