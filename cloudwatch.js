var zlib = require("zlib"),
    moment = require("moment"),
    getBaseIndex = require("./get-base-index-cwl"),
    omit = require("lodash.omit"),
    logger = require("./bulk-logger"),
    possiblyJSON = require('./possibly-json')

module.exports = function(awslogs) {
  var zippedInput = new Buffer(awslogs.data, "base64");
  return unzip(zippedInput)
    .then(parseJSON)
    .then(transform);
};

function unzip(input) {
  return new Promise(function(resolve, reject) {
    zlib.gunzip(input, function(error, buffer) {
      if (error) {
        reject(error);
      } else {
        resolve(buffer);
      }
    })
  });
}

function parseJSON(buffer) {
  return JSON.parse(buffer.toString("utf8"));
}

function transform(payload) {
  var bulk = [];

  if (payload.messageType === 'CONTROL_MESSAGE') {
    console.log('Received a control message');
    return bulk;
  }

  payload.logEvents.forEach(function(logEvent) {
    var log = possiblyJSON(logEvent.message),
        timestamp = moment.utc(logEvent.timestamp).toDate(),
        logId = logEvent.id,
        appName = payload.logGroup,
        process = "unknown",
        logName = logNameFromLogGroup(appName),
        labels = omit(logEvent, ['message', 'timestamp'])

    if (!log || log.length > 100000) {
      return
    }

    var entry = logger.entry(
      logName,
      {timestamp: timestamp, labels: labels},
      log,
      appName,
      process
    )

    bulk.push(entry)
  });

  return bulk;
}

function logNameFromLogGroup(appName) {
  return appName.toLowerCase()
    .replace(/(^[^a-z]+|[^a-z]+$)/g, '')
    .replace(/[^a-z]+/g, '-')
}
