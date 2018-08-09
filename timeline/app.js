'use strict';

/*
 *
 *  Copyright 2016-2017 Red Hat, Inc, and individual contributors.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const _mongoose = require('./lib/mongoose-wrapper');

let databaseInitTries = 3;
let databaseInitInterval = 1000;
let databaseInitialized = false;

function initDatabase () {
  _mongoose.connect()
  .then((connection) => {
    databaseInitialized = true;
    process.once('SIGUSR2', function () {
      console.log('About to close mongodb connection');
      if (connection) {
        connection.close(function (err) {
          if (err) {
            console.error('Error while closing connection', err);
          }
          console.log('About to kill process!');
          process.kill(process.pid, 'SIGUSR2');
        });
      }
    });
  })
  .catch((err) => {
    console.error('initDatabase err:', err);
    if (databaseInitTries > 0) {
      databaseInitTries--;
      setTimeout(initDatabase, databaseInitInterval);
    } else {
      //process.exit(1);
    }
  });
}
initDatabase();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/', express.static(path.join(__dirname, 'public')));

// Expose the license.html at http[s]://[host]:[port]/licences/licenses.html
app.use('/licenses', express.static(path.join(__dirname, 'licenses')));

// Hello World endpoint
app.use('/api/greeting', (request, response) => {
  const name = request.query ? request.query.name : undefined;
  response.send({ content: `Hi there, ${name || 'World!'}` });
});

// TODO: Add timeline API
app.use('/api/timeline', require('./lib/timeline.js')());

// TODO: Add liveness and readiness probes
app.use('/api/health/liveness', (request, response) => {
  if (databaseInitTries <= 0) {
    console.log('liveness', false);
    response.status(500).send({ status: 'failure', message: 'databaseInitTries reached zero' });
    return;  
  }
  console.log('liveness', true);
  response.send({ status: 'success' });
});

app.use('/api/health/readiness', (request, response) => {
  console.log('readiness', _mongoose.readiness());
  response.status(_mongoose.readiness() ? 200 : 500 ).send({ status: _mongoose.readiness() ? 'success' : 'failure' });
});

module.exports = app;
