/**
 * 8 - Clean up, tweak.
 */
const https = require('https'); // Built-in https module.
const fs = require('fs'); // Built-in filesystem module.
const express = require('express'); // Expressjs server framework.
const morgan = require('morgan'); // Logger middleware for expressjs.
const request = require('request'); // A convenient http request wrapper.

// Extracted proxy information for LocationIQ.
const LocationIQConfig = {
  prefix: '/locationiq',
  baseUrl: 'https://locationiq.org',
  query: { key: '93a4e4e1cf3f0c', format: 'json' }
};

// Initilize the main app instance with logger middleware.
const app = express().use(morgan('tiny'));

// Mount proxy application.
app.use(
  LocationIQConfig.prefix,
  express().use((req, res) => {
    const { baseUrl, query } = LocationIQConfig;
    const { method, path: uri, query: qs, headers } = req;
    Object.assign(qs, query);
    delete headers.host; // This is important before requesting.

    req.pipe(request({ method, baseUrl, headers, uri, qs })).pipe(res);
  })
);

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
