var chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  expect = require('chai').expect,
  kinesis = require('../kinesis'),
  getBaseIndex = require('../get-base-index')

chai.use(chaiAsPromised);

describe('Kinesis processor', function() {
  it('getBaseIndex() returns "plain-logs.unknown.unknown" with poor metadata', function() {
    var logWithPoorMetadata = {
      'log': 'herp derp',
      'time': '2016-06-12T23:50:19.970290212Z',
      'hostname': 'staging-a-worker-1feda598',
      '@timestamp': '2016-06-12T23:50:19Z'
    },
    result = getBaseIndex(logWithPoorMetadata)
    expect(result).to.equal('plain-logs.unknown.unknown.')
  })

  it('processes kinesis events', function() {
    var kinesisRecords = require('./kinesis-sample.json'),
        indexKey = 'plain-logs.staging.larder.2016.06.12',
        typeKey = 'arn:aws:kinesis:EXAMPLE',
        expectedIndex = {index: {_index: indexKey, _type: typeKey}},
        expectedObject = {
          '@timestamp': '2016-06-12T23:50:19Z',
          'docker': {
            'container_hostname': '510d69680a24',
            'id': 'deadbeef',
            'image': 'quay.io/everydayhero/larder:current',
            'image_id': 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            'labels': {
              'app': {
                'command': 'work-s3',
                'env': 'staging',
                'name': 'larder'
              }
            },
            'name': 'larder-staging-work-s3-0.service'
          },
          'hostname': 'staging-a-worker-1feda598',
          'log': 'INFO: Successfully published 12 datums.\n',
          'stream': 'stderr',
          'time': '2016-06-12T23:50:19.970290212Z'
        },
        expected = [
          JSON.stringify(expectedIndex),
          JSON.stringify(expectedObject),
        ],
        result = kinesis(kinesisRecords.Records)

    return expect(result).to.eventually.become(expected)
  })
})
