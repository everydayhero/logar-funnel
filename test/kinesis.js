var chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  expect = require('chai').expect,
  kinesis = require('../kinesis')

chai.use(chaiAsPromised);

describe('Kinesis processor', function() {
  it('processes kinesis events', function() {
    var kinesisRecords = require('./kinesis-sample.json'),
        indexKey = 'kinesis-2016.06.12',
        typeKey = 'arn:aws:kinesis:EXAMPLE',
        expectedIndex = {index: {_index: indexKey, _type: typeKey}},
        expectedObject = {
          'log': 'INFO: Successfully published 12 datums.\n',
          'stream': 'stderr',
          'time': '2016-06-12T23:50:19.970290212Z',
          'docker': {
            'id': 'deadbeef',
            'name': 'larder-staging-work-s3-0.service',
            'container_hostname': '510d69680a24',
            'image': 'quay.io/everydayhero/larder:current',
            'image_id': 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            'labels': {
              'app.command': 'work-s3',
              'app.env': 'staging',
              'app.name': 'larder'
            }
          },
          'hostname': 'staging-a-worker-1feda598',
          '@timestamp': '2016-06-12T23:50:19Z'
        }
        expected = [
          JSON.stringify(expectedIndex),
          JSON.stringify(expectedObject),
        ],
        result = kinesis(kinesisRecords.Records)

    return expect(result).to.eventually.become(expected)
  })
})
