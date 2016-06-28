var BulkLogger = require('gcloud-bulk-logger').default

var logger = new BulkLogger('edh-logging-test', 'keyfile.json')

module.exports = logger
