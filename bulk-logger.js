var BulkLogger = require('gcloud-bulk-logger').default

var clientId = process.env.GCLOUD_EMAIL
var privateKey = process.env.GCLOUD_PRIVATE_KEY
var projectName = process.env.GCLOUD_PROJECT_NAME

var logger = new BulkLogger(projectName, clientId, privateKey)

module.exports = logger
