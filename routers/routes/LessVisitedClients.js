const express = require("express");
const {
  lessVisitedClients,
  verifyCache,
} = require("../controllers/LessVisitedClients");

const clientRouter = express.Router();

clientRouter.get(
  "/less-visited-clients-per-day",
  verifyCache,
  lessVisitedClients
);

module.exports = clientRouter;
