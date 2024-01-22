const rolesService = require("../services/roles.service");
const errorHandler = require("../utils/errors.util");
const { getControllerToServiceFilter } = require("../utils/controller.util");

const get = async (req, res, next) => {
  try {
    res.json(await rolesService.getMany(getControllerToServiceFilter(req.query)));
  } catch (err) {
    console.log(`Error while getting roles`, err);
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    res.json(await rolesService.create(req.body));
  } catch (err) {
    console.log(`Error while creating a role`, err);
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    if (req.body.hasOwnProperty("created_at") || req.body.hasOwnProperty("updated_at")) {
      return next(errorHandler.badRequest("Can't modify system values"));
    }
    res.json(await rolesService.update(req.params.id, req.body));
  } catch (err) {
    console.log(`Error while updating a role`, err);
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    res.json(await rolesService.remove(req.params.id));
  } catch (err) {
    console.log(`Error while deleting a role`, err);
    next(err);
  }
};

module.exports = {
  get,
  create,
  update,
  remove,
};