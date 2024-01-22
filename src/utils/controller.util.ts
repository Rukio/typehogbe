import {GetManyParams} from "../services/roles.service";

type GetControllerToServiceFilterType = {
  page: string;
  limit: string;
  orderBy: GetManyParams["order"]["field"];
  sort: GetManyParams["order"]["direction"];
  [key: string]: string;
};

const getControllerToServiceFilter = (
  { page, limit, orderBy, sort, ...filterFields }: GetControllerToServiceFilterType
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

module.exports = {
  getControllerToServiceFilter,
}
