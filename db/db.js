const mongoose = require("mongoose");
require("dotenv").config();
const fs = require("fs");
const VisitsTable = require("./models/visits");
const UsersTable = require("./models/users");
const ClientsTable = require("./models/clients");

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

// connecting mongoose
mongoose.connect(process.env.DB_URI, options).then(
  () => {
    console.log("DB Ready To Use");
  },
  (err) => {
    console.log(err);
  }
);

// Check if there is any data saved in local collection in mongoDb if the json data not found I will add it locally to data to start work on it
mongoose.connection.collection("clients").countDocuments(function (err, count) {
  if (count == 0) {
    let clientsLocalData = fs.readFileSync("./db/localData/clients.json");
    let clients = JSON.parse(clientsLocalData);
    ClientsTable.insertMany(clients);
  }
});

// Check if there is any data saved in local collection in mongoDb if the json data not found I will add it locally to data to start work on it
mongoose.connection.collection("users").countDocuments(function (err, count) {
  if (count == 0) {
    let usersLocalData = fs.readFileSync("./db/localData/users.json");
    let users = JSON.parse(usersLocalData);
    UsersTable.insertMany(users);
  }
});

// Check if there is any data saved in collection in mongoDb if the json data not found I will add it locally to data to start work on it
mongoose.connection.collection("visits").countDocuments(function (err, count) {
  if (count == 0) {
    let visitsLocalData = fs.readFileSync("./db/localData/visits.json");
    let visits = JSON.parse(visitsLocalData);
    VisitsTable.insertMany(visits);
  }
});
