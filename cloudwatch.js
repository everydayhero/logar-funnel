var zlib = require("zlib"),
    moment = require("moment"),
    getBaseIndex = require("./get-base-index-cwl")

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
    var timestamp = moment.utc(logEvent.timestamp),
        indexKey = getBaseIndex(payload) + timestamp.format("YYYY.MM.DD"),
        source = buildSource(logEvent.message, logEvent.extractedFields)

    source['@id'] = logEvent.id;
    source['@timestamp'] = timestamp.format();
    source['@message'] = logEvent.message;
    source['@owner'] = payload.owner;
    source['@log_group'] = payload.logGroup;
    source['@log_stream'] = payload.logStream;

    var action = { "index": {} };
    action.index._index = indexKey;
    action.index._type = payload.logGroup;
    action.index._id = logEvent.id;

    bulk.push(
      JSON.stringify(action),
      JSON.stringify(source)
    );
  });

  return bulk;
}

function buildSource(message, extractedFields) {
  if (extractedFields) {
    var source = {};

    for (var key in extractedFields) {
      if (extractedFields.hasOwnProperty(key) && extractedFields[key]) {
        var value = extractedFields[key];

        if (isNumeric(value)) {
          source[key] = 1 * value;
          continue;
        }

        jsonSubString = extractJson(value);
        if (jsonSubString !== null) {
          source['$' + key] = JSON.parse(jsonSubString);
        }

        source[key] = value;
      }
    }
    return source;
  }

  jsonSubString = extractJson(message);
  if (jsonSubString !== null) {
    return JSON.parse(jsonSubString);
  }

  return {};
}

function extractJson(message) {
  var jsonStart = message.indexOf('{');
  if (jsonStart < 0) return null;
  var jsonSubString = message.substring(jsonStart);
  return isValidJson(jsonSubString) ? jsonSubString : null;
}

function isValidJson(message) {
  try {
    JSON.parse(message);
  } catch (e) { return false; }
  return true;
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
