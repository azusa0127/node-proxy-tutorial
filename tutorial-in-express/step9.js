/**
 * 9 - Generalize
 */
const https = require('https'); // Built-in https module.
const fs = require('fs'); // Built-in filesystem module.
const express = require('express'); // Expressjs server framework.
const morgan = require('morgan'); // Logger middleware for expressjs.
const request = require('request'); // A convenient http request wrapper.

// A static configuration that can be extracted into json config file.
const CONFIGS = [
  {
    prefix: '/locationiq',
    baseUrl: 'https://locationiq.org',
    query: { key: '93a4e4e1cf3f0c', format: 'json' },
    headers: {}
  }
];

// Initilize the main app instance with logger middleware.
const app = express().use(morgan('tiny'));

// Iterate and mount proxy applications specified in CONFIGS.
for (const { prefix, baseUrl, query = {}, headers = {} } of CONFIGS) {
  app.use(
    prefix,
    express().use((req, res) => {
      const remoteReqOption = {
        baseUrl,
        method: req.method,
        uri: req.path,
        headers: { ...req.headers, ...headers },
        qs: { ...req.query, ...query }
      };
      if (remoteReqOption.headers.host) delete remoteReqOption.headers.host;

      req.pipe(request(remoteReqOption)).pipe(res);
    })
  );
}

// Initialize a https server.
https
  .createServer(
    {
      cert: fs.readFileSync('cert/server.crt'),
      key: fs.readFileSync('cert/server.key')
    },
    app // Use express app as requests listener.
  )
  .listen(3000);

console.log('express is now listening at https://localhost:3000');
