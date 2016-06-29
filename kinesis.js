var moment = require("moment"),
    getBaseIndex = require("./get-base-index"),
    dot = require("dot-object"),
    stableStringify = require("json-stable-stringify"),
    get = require('lodash.get'),
    omit = require("lodash.omit"),
    logger = require("./bulk-logger"),
    possiblyJSON = require('./possibly-json')

module.exports = function(records, cb) {
  return Promise.resolve(records).then(transform);
};

function getIndex(entry, timestamp, eventSourceARN) {
  var indexKey = getBaseIndex(entry) + timestamp.format("YYYY.MM.DD"),
      typeKey = eventSourceARN.split("/").pop(),
      index = {index: {_index: indexKey, _type: typeKey}}

  return index
}

function transform(records) {
  var bulk = [];

  records.forEach(function(record) {
    var data = parse(record),
        log = possiblyJSON(data.log || data.message),
        timestamp = moment.utc(data.time || moment()).toDate(),
        labels = dot.dot(omit(data, ['log', 'time'])),
        appName = get(labels, 'docker.labels.app.name', 'unknown'),
        process = get(labels, 'docker.labels.app.command', 'unknown'),
        env = get(labels, 'docker.labels.app.env', 'unknown'),
        logName = env + "." + appName

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

function parse(record) {
  if ("kinesis" in record) {
    return decode(record.kinesis.data);
  } else {
    throw new Error("Invalid kinesis record:", record);
  }
}

function decode(data) {
  var buffer = new Buffer(data, "base64").toString("utf8");
  return JSON.parse(buffer);
}
