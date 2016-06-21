var processors = {
  "awslogs": require("./cloudwatch"),
  "Records": require("./kinesis")
};

module.exports = function(input) {
  var processor = nullProcessor;
  var keys = Object.keys(processors);
  var key, value;

  while (key = keys.shift()) {
    value = input[key];
    if (isValid(value)) {
      processor = processors[key];
      break;
    }
  }

  return processor(value);
}

function nullProcessor() {
  return Promise.reject("No processor found");
}

function isValid(value) {
  var type = typeof(value);
  return type !== "null" && type !== "undefined";
}
