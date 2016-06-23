function getBaseIndexCWL(payload) {
  var indexPart = payload.logGroup
    .replace(/\W+/g, "-")
    .replace(/^\W|\W$/g, "")

  return 'cwl.' + indexPart + '.'
}

module.exports = getBaseIndexCWL
