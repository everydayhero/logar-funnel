var dasherize = require('dasherize')

function getBaseIndexCWL(payload) {
  var indexPart = payload.logGroup
    .replace(/\W+/g, "-")
    .replace(/^\W|\W$/g, "")

  return 'cwl.' + dasherize(indexPart) + '.'
}

module.exports = getBaseIndexCWL
