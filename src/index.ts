const express = require("express");
const app = express();
const WSServer = require("express-ws")(app);
const { PORT } = require("./configs/general.config");
const raceSocketRouter = require("./routes/raceSockets.route");
const scoresRouter = require("./routes/scores.route");
const racesRouter = require("./routes/races.route");
const paragraphsRouter = require("./routes/paragraphs.route");
const rolesRouter = require("./routes/roles.route");
const langsRouter = require("./routes/langs.route");
const sourcesRouter = require("./routes/sources.route");
const usersRouter = require("./routes/users.route");
const errorHandlerMiddleware = require("./middleware/errorHandler.middleware");
const commonFieldGuard = require("./middleware/commonFieldGuard.middleware");

app.use(express.json());
app.use(commonFieldGuard);
app.use("/v1/websockets", raceSocketRouter);
app.use("/v1/scores", scoresRouter);
app.use("/v1/races", racesRouter);
app.use("/v1/paragraphs", paragraphsRouter);
app.use("/v1/roles", rolesRouter);
app.use("/v1/langs", langsRouter);
app.use("/v1/sources", sourcesRouter);
app.use("/v1/users", usersRouter);
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
	console.log(`Running on ${PORT}`);
});
