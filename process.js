var processors = {
  "awslogs": require("./awslogs"),
  "Records": require("./kinesis")
};
var processorKeys = Object.keys(processors);

module.exports = function(input) {
  var processor = nullProcessor;
  var value;

  for (key in processorkeys) {
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
