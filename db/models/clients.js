const mongoose = require("mongoose");

const clients = new mongoose.Schema({
  name: { type: String, required: true },
});

module.exports = mongoose.model("Clients", clients);
