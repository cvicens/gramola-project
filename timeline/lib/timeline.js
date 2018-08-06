const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

function readiness() {
  console.log('readyState', mongoose.connection.readyState);
  return mongoose && mongoose.connection && mongoose.connection.readyState != 0;
}

function route() {
  let router = new express.Router();
  router.use(cors());
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: true }));

  // Miiddle ware to check db connection
  router.use(function (req, res, next) {
    if (!readiness()) {
      res.status(500).json({status: 'failure', desc: 'Connection not ready'});
      return;
    }
    next();
  })

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

module.exports = route;