const express = require("express");
const db = require("./db/db");
require("dotenv").config();

const app = express();

app.use(express.json());

//routers
const clientRouter = require("./routers/routes/LessVisitedClients");

// router middleware
app.use("/", clientRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server on ${PORT}`);
});
