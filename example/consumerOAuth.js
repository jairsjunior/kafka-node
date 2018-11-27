'use strict';

var kafka = require('../kafka');
var Consumer = kafka.Consumer;
var Offset = kafka.Offset;
var argv = require('optimist').argv;
var topic = argv.topic || 'topic1';

const client = new kafka.KafkaClient({
  kafkaHost: 'localhost:9094',
  sasl: {
    mechanism: 'OAUTHBEARER',
    protocol: 'https',
    url: 'localhost:9999',
    endpoint: '/oauth/token?grant_type=client_credentials&scope={SCOPE_NAME}',
    token: 'Basic token'
  },
  connectRetryOptions: {
    retries: 0
  },
  noAckBatchOptions: null
});
var topics = [{ topic: topic, partition: 0 }];
var options = { autoCommit: false, fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024, groupId: 'group-app' };

var consumer = new Consumer(client, topics, options);
var offset = new Offset(client);

consumer.on('message', function (message) {
  console.log(message);
});

consumer.on('error', function (err) {
  console.log('error', err);
});

/*
* If consumer get `offsetOutOfRange` event, fetch data from the smallest(oldest) offset
*/
consumer.on('offsetOutOfRange', function (topic) {
  topic.maxNum = 1;
  offset.fetch([topic], function (err, offsets) {
    if (err) {
      return console.error(err);
    }
    var min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
    consumer.setOffset(topic.topic, topic.partition, min);
  });
});
