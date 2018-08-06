// TODO: Add mongoose support
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME || "mydb";
const DB_SERVICE_NAME = process.env.DB_SERVICE_NAME || "localhost";
const DB_SERVICE_PORT = process.env.DB_SERVICE_PORT || "27017";

const options = {
  //useNewUrlParser: true,
  //useMongoClient: true,
  //autoIndex: false, // Don't build indexes
  //autoReconnect: true,
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
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

mongoose.connection.on('connecting', function() {
    console.log('Connecting to MongoDB...');
});

mongoose.connection.on('error', function(error) {
    console.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
});
mongoose.connection.on('connected', function() {
    console.log('MongoDB connected!');
});
mongoose.connection.once('open', function() {
    console.log('MongoDB connection opened!');
});
mongoose.connection.on('reconnected', function () {
    console.log('MongoDB reconnected!');
});
mongoose.connection.on('disconnected', function() {
    console.log('MongoDB disconnected!');
});

function connect() {
    return new Promise((resolve, reject) => {
        mongoose.connect(`mongodb://${DB_SERVICE_NAME}:${DB_SERVICE_PORT}/${DB_NAME}`, options)
        .then((res) => {
            console.log('mongoose connected to ', `mongodb://${DB_SERVICE_NAME}:${DB_SERVICE_PORT}/${DB_NAME}`);
            resolve(mongoose.connection)
        })
        .catch((err) => {
            reject(err);
          }
        );
    });
}

function readiness() {
    return mongoose && mongoose.connection && mongoose.connection.readyState != 0;
}

module.exports.connect = connect;
module.exports.readiness = readiness;