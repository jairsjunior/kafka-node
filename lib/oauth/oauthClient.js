const axios = require('axios');

async function callOAuth (saslOpts) {
  const options = {
    url: `${saslOpts.protocol || 'https'}://${saslOpts.url}${saslOpts.endpoint}`,
    method: 'POST',
    headers: {
      'Authorization': `${saslOpts.token}`
    },
    rejectUnauthorized: false
  };
  let result = await axios(options);
  if (result.status === 200) {
    return result.data;
  }
  return new Error('error at call OAuth server: returnCode: ' + result.status + ' url:' + options.url);
}

async function mountJWT (saslOpts) {
  const token = {
    value: '',
    scope: [],
    lifetimeMs: 0,
    startTimeMs: null,
    principalName: ''
  };
  let result = await callOAuth(saslOpts);
  if (result.access_token == null) {
    return new Error('error at moungJWT because result doesnt have access_token');
  }
  token.value = result.access_token;
  token.startTimeMs = new Date().getTime();
  token.lifetimeMs = token.startTimeMs + (result.expires_in * 1000);
  return token;
}

exports.callOAuth = callOAuth;
exports.mountJWT = mountJWT;
