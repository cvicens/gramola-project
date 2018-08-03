const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// TODO: Add mongoose support
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME || "mydb";
const DB_SERVICE_NAME = process.env.DB_SERVICE_NAME || "localhost";
const DB_SERVICE_PORT = process.env.DB_SERVICE_PORT || "27017";

const options = {
  //useMongoClient: true,
  //autoIndex: false, // Don't build indexes
  reconnectTries: 15, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  //poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  //family: 4 // Use IPv4, skip trying IPv6
  user: DB_USERNAME,
  pass: DB_PASSWORD
};

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.connect(`mongodb://${DB_SERVICE_NAME}:${DB_SERVICE_PORT}/${DB_NAME}`, options)
.then((res) => console.log('mongoose connected to ', `mongodb://${DB_SERVICE_NAME}:${DB_SERVICE_PORT}/${DB_NAME}`))
.catch((err) => {
    console.error(err);
    process.exit(1);
  }
);

let timelineEntrySchema = new Schema({
    id: String,
    eventId: String,
    userId: String,

    title:  String,

    date: String,
    time: String,

    body: String,
    image: String
}); 
const TimelineEntry = mongoose.model('TimelineEntry', timelineEntrySchema);

function findTimelineEntriesByEventIdAndUserId(eventId, userId) {
  return new Promise((resolve, reject) => {
    TimelineEntry.find({ eventId: eventId, userId: userId }, function(err, entries) {
        if (err) {
            console.error('Error @findTimelineEntriesByEventIdAndUserId ', err);
            reject(err);
            return;
        }
        console.log('entries: ', entries);
        resolve(entries);
    });
  });
}

function createTimelineEntry(newEntry) {
    return new Promise((resolve, reject) => {
      TimelineEntry.create(newEntry, function(err, entries) {
          if (err) {
              console.error('Error @createTimelineEntry ', err);
              reject(err);
              return;
          }
          console.log('entries created: ', entries);
          resolve(entries);
      });
    });
  }

function getIsoDate (date) {
  if (!date) {
    return null;
  }
  return date.getFullYear() + "-" + ('0' + (date.getMonth() + 1)).slice(-2) + "-" + ('0' + date.getDate()).slice(-2);
}

function route() {
  let router = new express.Router();
  router.use(cors());
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: true }));

  // Finding an event by eventId, userId, ...
  router.get('/:eventId/:userId', function(req, res) {
    let eventId = req.params.eventId;
    let userId = req.params.userId;
    console.log('Find event by eventId', eventId, 'userId', userId);
    if (typeof eventId === 'undefined' || eventId == '' ||
        typeof userId === 'undefined' || userId == '') {
      res.status(400).json([]);
    }
    
    findTimelineEntriesByEventIdAndUserId(eventId, userId).
    then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      res.status(500).json({result:'ERROR', msg: err})
    });
  });

  // Finding an event by eventId, userId, ...
  router.post('/', function(req, res) {
    let entry = req.body;
    console.log('Create new entry', entry);
    if (typeof entry === 'undefined' || entry == '') {
      res.status(400).json([]);
    }
    
    createTimelineEntry(entry).
    then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      res.status(500).json({result:'ERROR', msg: err})
    });
  });

  return router;
}

function readiness() {
    return mongoose && mongoose.connection && mongoose.connection.readyState != 0;
}

module.exports.route = route;
module.exports.readiness = readiness;