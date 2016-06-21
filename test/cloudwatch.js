var chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  expect = require('chai').expect,
  cloudwatch = require('../cloudwatch');

chai.use(chaiAsPromised);

describe('Cloudwatch processor', function() {
  it('processes cloudwatch events', function() {
    var logSample = require('./cloudwatch-sample.json'),
        expectedIndex1 = {
          index: {
            _index: 'cwl.aws-lambda-postoffice.2015.08.24',
            _type: '/aws/lambda/postoffice/',
            _id: "eventId1"
          }
        },
        expectedIndex2 = {
          index: {
            _index: 'cwl.aws-lambda-postoffice.2015.08.24',
            _type: '/aws/lambda/postoffice/',
            _id: "eventId2"
          }
        },
        expectedObject1 = {
          "@id": "eventId1",
          "@timestamp": "2015-08-24T19:03:07Z",
          "@message": "[ERROR] First test message",
          "@owner": "123456789123",
          "@log_group": "/aws/lambda/postoffice/",
          "@log_stream": "testLogStream"
        },
        expectedObject2 = {
          "@id": "eventId2",
          "@timestamp": "2015-08-24T19:03:07Z",
          "@message": "[ERROR] Second test message",
          "@owner": "123456789123",
          "@log_group": "/aws/lambda/postoffice/",
          "@log_stream": "testLogStream"
        },
        expected = [
          JSON.stringify(expectedIndex1),
          JSON.stringify(expectedObject1),
          JSON.stringify(expectedIndex2),
          JSON.stringify(expectedObject2)
        ],
        result = cloudwatch(logSample.awslogs)

    return expect(result).to.eventually.become(expected)
  })
})
