const mongoose = require("mongoose");

const visits = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: "Clients" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  time: { type: Number },
});

module.exports = mongoose.model("Visits", visits);
