var moment = require("moment");

module.exports = function(records, cb) {
  return Promise.resolve(records).then(transform);
};

function transform(records) {
  var bulk = [];

  records.forEach(function(record) {
    var data = parse(record);
    var timestamp = moment.utc(data["@timestamp"] || data.timestamp || data.time);
    var indexKey = timestamp.format("[kinesis-]YYYY.MM.DD");
    var typeKey = record.eventSourceARN.split("/").pop();
    var index = {index: {_index: indexKey, _type: typeKey}};

    var entry = expandDotNotation(data);
    entry["@timestamp"] = timestamp.format();

    bulk.push(
      JSON.stringify(index),
      JSON.stringify(entry)
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
  var result = {}, edge, parts, part, leaf;

  for (var key in input) {
    edge = result;
    parts = key.split('.');
    leaf = parts.pop();

    while (parts.length) {
      part = parts.shift();
      edge = edge[part] = edge[part] || {};
    }

    edge[leaf] = input[key]
  }

  return result;
}
