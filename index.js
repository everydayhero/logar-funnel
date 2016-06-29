require("es6-promise").polyfill();

var fetch = require("node-fetch");
var doProcess = require("./process");
var logger = require("./bulk-logger")

var endpoint = process.env.ENDPOINT;

exports.handler = function(input, context) {
  doProcess(input)
    .then(post)
    .then(assumeWeWroteEverything)
    .then(summarize)
    .then(context.succeed, context.fail);
};

function assumeWeWroteEverything(bulk) {
  return bulk.length
}

function post(bulk) {
  return logger.write(bulk)
    .then(function() { return bulk })
}

function summarize(count) {
  console.log({
    successfulItems: count
  });

  return "Success"
}

function values(object) {
  return Object.keys(object).map(function(key) {
    return object[key];
  });
}
