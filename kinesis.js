var moment = require("moment"),
    getBaseIndex = require("./get-base-index"),
    dot = require("dot-object"),
    stableStringify = require("json-stable-stringify")

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
    var data = parse(record);
    var timestamp = moment.utc(data["@timestamp"] || data.timestamp || data.time);
    var entry = expandDotNotation(data);
    entry["@timestamp"] = timestamp.format();
    var index = getIndex(entry, timestamp, record.eventSourceARN);

    bulk.push(
      stableStringify(index),
      stableStringify(entry)
    );
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

function expandDotNotation(input) {
  return dot.object(dot.dot(input));
}
