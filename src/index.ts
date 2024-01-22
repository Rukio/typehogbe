const express = require("express");
const { PORT } = require("./configs/general.config");
const rolesRouter = require("./routes/roles.route");
const errorHandlerMiddleware = require("./middleware/ErrorHandler.middleware");

const app = express();

app.use(express.json());
app.use("/v1/roles", rolesRouter);
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(`Running on ${PORT}`);
});