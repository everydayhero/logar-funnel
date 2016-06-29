function possiblyJSON(string) {
  var trimmed = string.trim()

  if (trimmed[0] == '{' && trimmed[trimmed.length-1] == '}') {
    try {
      return JSON.parse(trimmed);
    } catch (e) {
      return trimmed;
    }
  } else {
    return trimmed;
  }
}

module.exports = possiblyJSON
