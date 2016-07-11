var BulkLogger = require('gcloud-bulk-logger').default

var clientId = process.env.GCLOUD_EMAIL
var privateKey = process.env.GCLOUD_PRIVATE_KEY

var logger = new BulkLogger('edh-logging-test', clientId, privateKey)

module.exports = logger
