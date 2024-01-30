const db = require("../services/db.service");

export type QueryParams = {
  tableName: string;
  pagination?: {
    page: number;
    limit: number;
  };
  order?: {
    field: string;
    direction?: "asc" | "desc";
  };
  filter?: {
    [key: string]: string;
  };
	returning?: string[];
};

type GetQueryResult = {
  query: string;
  values: unknown[];
};

type GetInsertInto = {
  tableName: string;
	returnId?: boolean;
	returnUuid?: boolean;
  data: {
    [key: string]: any;
  };
};

type GetUpdate = {
  tableName: string;
  id: number;
  data: {
    [key: string]: any;
  };
};

const getWhere = (filter: QueryParams["filter"]): string => {
	let result: string = "WHERE ";
	const resultArray: string[] = [];

	if (!Object.values(filter).length) {
		return "";
	}

	for (const key in filter) {
		const valueInit = filter[key];
		const boolType = valueInit === "true" || valueInit === "false";
		let value = valueInit;
		let operator = "=";

		if (isNaN(Number(valueInit))) {
			if (
				valueInit.indexOf(">") === 0 ||
          valueInit.indexOf("<") === 0 ||
          valueInit.indexOf("~") === 0
			) {
				operator = valueInit[0];

				if (valueInit[0] === "~") {
					value = `'${valueInit.slice(1)}'`;
				} else {
					value = valueInit.slice(1);
				}
			} else if (!boolType) {
				value = `'${valueInit}'`;
			}
		}

		resultArray.push(`${key} ${operator} ${value}`);
	}

	result += `(${resultArray.join(" AND ")})`;

	return result;
};

const getOrderBy = (filter: QueryParams["order"]): string => filter ?
	`ORDER BY ${filter.field}${filter.direction ? ` ${filter.direction.toUpperCase()}` : ""}` :
	"";

const getSelectQuery = ({ tableName, pagination, order, filter, returning }: QueryParams): GetQueryResult => ({
	query: `SELECT ${returning ? `${returning.join(",")}` : "*"} FROM ${
		tableName}${
		filter ? ` ${getWhere(filter)}` : ""
	}${
		order ? ` ${getOrderBy(order)}` : ""
	}${
		pagination ? " LIMIT $2 OFFSET (($1 - 1) * $2)" : ""
	}`,
	values: pagination ? [pagination.page, pagination.limit] : null,
});

const getInsertInto = ({ tableName, returnId, returnUuid, data }: GetInsertInto): GetQueryResult => {
	const dataPrepared = {
		...data,
		created_at: Date.now(),
		updated_at: null,
	};
	const keys: string[] = Object.keys(dataPrepared);

	return {
		query: `INSERT INTO ${tableName}
      (${keys.join(", ")})
      VALUES (
        ${[...new Array(keys.length + 1).keys()]
		.map((_n, i) => `$${i}`)
		.slice(1)
		.join(", ")
}
      )${returnId ? " RETURNING id" : ""
}${
	returnId && returnUuid ? ", uuid" : ""
}`,
		values: Object.values(dataPrepared),
	};
};

const getUpdate = ({ tableName, id, data }: GetUpdate): GetQueryResult => {
	const dataPrepared = {
		...data,
		updated_at: Date.now(),
	};
	const dataKeys = Object.keys(dataPrepared);

	return {
		query: `UPDATE ${tableName}
      SET ${
	dataKeys
		.map((n, i) => `${n}=$${i + 1}`)
} WHERE id=$${dataKeys.length + 1}`,
		values: [
			...Object.values(dataPrepared),
			id,
		],
	};
};

const removeById = async (id: number, tableName: string) => db.query(
	`DELETE FROM ${tableName} WHERE id=$1`,
	[id],
);

module.exports = {
	getSelectQuery,
	getInsertInto,
	getUpdate,
	removeById,
};
