require("es6-promise").polyfill();

var fetch = require("node-fetch");
var doProcess = require("./process");

var endpoint = process.env.ENDPOINT;

exports.handler = function(input, context) {
  doProcess(input)
    .then(post)
    .then(summarize)
    .then(context.succeed, context.fail);
};

function post(bulk) {
  var body = bulk.join("\n") + "\n";
  var params = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Host": endpoint
    },
    body: body
  };

  return fetch(endpoint + "/_bulk", params);
}

function summarize(res) {
  console.log(res.ok);
  console.log(res.status);
  console.log(res.statusText);

  return res.json().then(function(info) {
    var failedItems, errors = {};

    failedItems = info.items.filter(function(x) {
      return x.status >= 300;
    });

    failedItems.forEach(function(x) {
      errors[x.error.type] = x.error;
    });

    console.log({
      attemptedItems: info.items.length,
      successfulItems: info.items.length - failedItems.length,
      failedItems: failedItems.length,
      errors: values(errors)
    });

    if (res.ok) {
      return Promise.resolve("Success");
    } else {
      return Promise.reject("Failed: " + res.statusText);
    }
  });
}

function values(object) {
  return Object.keys(object).map(function(key) {
    return object[key];
  });
}
