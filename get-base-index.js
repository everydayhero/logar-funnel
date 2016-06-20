var get = require('lodash.get')

function getBaseIndex(entry) {
  var env = get(entry, 'docker.labels.app.env', 'unknown'),
      name = get(entry, 'docker.labels.app.name', 'unknown'),
      baseIndex = 'plain-logs.' + env + '.' + name + '.'

  return baseIndex
}

module.exports = getBaseIndex
