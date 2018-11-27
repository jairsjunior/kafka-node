var kafka = require('../kafka');
var Producer = kafka.Producer;
var KeyedMessage = kafka.KeyedMessage;
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
var argv = require('optimist').argv;
var topic = argv.topic || 'topic1';
var p = argv.p || 0;
var a = argv.a || 0;
var producer = new Producer(client, { requireAcks: 1 });

producer.on('ready', function () {
  var max = 10000;
  var min = 0;
  setInterval(() => {
    var message = `a message ${Math.floor(Math.random() * (max - min + 1)) + min}`;
    var keyedMessage = new KeyedMessage('keyed', `a keyed message ${Math.floor(Math.random() * (max - min + 1)) + min}`);
    producer.send([
      { topic: topic, partitions: p, messages: [message, keyedMessage], attributes: a }
    ], function (err, result) {
      console.log(err || result);
    });
  }, 3000);
});

producer.on('error', function (err) {
  console.log('error', err);
});
