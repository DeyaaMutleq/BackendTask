const visitsModel = require("../../db/models/visits");
const clientsModel = require("../../db/models/clients");
const NodeCache = require("node-cache");
const cache = new NodeCache();

// Middleware function
const verifyCache = (req, res, next) => {
  try {
    let from = parseInt(req.query.from);
    let to = parseInt(req.query.to);
    let day = req.query.day.toLowerCase();

    // Make unique cacheId
    const cacheId = to - from + day;
    // Check the cache
    if (cache.has(cacheId)) {
      // Return data from cache
      return res.status(200).json(cache.get(cacheId));
    }
    // go to next function lessVisitedClients
    return next();
  } catch (err) {
    throw new Error(err);
  }
};

const lessVisitedClients = async (req, res) => {
  let from = parseInt(req.query.from);
  let to = parseInt(req.query.to);
  let day = req.query.day.toLowerCase();

  const weekday = [
    "",
    "sunday", // 1
    "monday", // 2
    "tuesday", // 3
    "wednesday", // 4
    "thursday", // 5
    "friday", // 6
    "saturday", // 7
  ];

  //To Convert Day to Day of week that's send in request

  let dayOfWeekFromQuery = weekday.indexOf(day).toString();

  let lessVisit;
  let unVisitedClients;

  try {
    lessVisit = await visitsModel.aggregate([
      // To Calculate dayOfWeek and add it to visit object
      {
        $project: {
          _id: 0,
          client: 1,
          time: 1,
          // To get Day of week from 1 to 7
          dayOfWeek: {
            $dateToString: {
              format: "%w",
              date: {
                $toDate: "$time",
              },
            },
          },
        },
      },

      // Make conditions in timestamp and dayOfWeek
      {
        $match: {
          time: {
            $lte: to,
            $gte: from,
          },
          dayOfWeek: dayOfWeekFromQuery,
        },
      },

      // To get client data from clients collection
      {
        $lookup: {
          from: "clients",
          localField: "client",
          foreignField: "_id",
          as: "client_info",
        },
      },

      // To delete Array from client_info data
      { $unwind: "$client_info" },

      // Group Same Client And Count them
      {
        $group: {
          _id: { clientName: "$client_info.name" },
          count: { $sum: 1 },
        },
      },

      {
        $project: {
          _id: 0,
          clientName: "$_id.clientName",
          count: 1,
        },
      },

      // To sort data from low to high
      { $sort: { count: 1 } },
    ]);

    const arr = [];
    // To take Client Name without count to make compare with Client Collection to check unvisited clients
    for (let x = 0; x < lessVisit.length; x++) {
      arr.push({ clientName: lessVisit[x].clientName });
    }

    unVisitedClients = await clientsModel.aggregate([
      // Check if the client visit or not
      {
        $project: {
          _id: 0,
          clientName: "$name",
          clientVisit: {
            $in: [
              {
                clientName: "$name",
              },
              arr,
            ],
          },
        },
      },

      {
        $match: {
          clientVisit: false,
        },
      },

      {
        $project: {
          clientName: 1,
          count: { $sum: 0 },
        },
      },
    ]);
  } catch {
    console.log("err");
  }

  // To push unVisited Clients to be at the TOP of the less visited
  for (let x = 0; x < unVisitedClients.length; x++) {
    lessVisit.unshift(unVisitedClients[x]);
  }

  // To add data to cache
  // Make unique cacheId
  const cacheId = to - from + day;
  cache.set(cacheId, lessVisit);

  res.status(200);
  res.send(lessVisit);
};

module.exports = {
  lessVisitedClients,
  verifyCache,
};
