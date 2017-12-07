/**
 * 7 - Use request package to simplify the code.
 */

const https = require('https'); // Built-in https module.
const fs = require('fs'); // Built-in filesystem module.
const express = require('express'); // Expressjs server framework.
// Import some middlewares.
const responseTime = require('response-time'); // Response-time header middleware for expressjs.
const morgan = require('morgan'); // Logger middleware for expressjs.
const request = require('request'); // A convenient http request wrapper.

// The sub-application later mount at /locationiq
const locationiqApp = express().use((req, res) => {
  // Print the request properties for debugging.
  const { method, url, path, params, query, headers, body } = req;
  console.log('req: ', { method, url, path, params, query, headers, body });
  // Remove the old host header as we are forwarding request.
  delete headers.host;
  // Lets forward the request to LocationIQ API https://locationiq.org/
  const baseUrl = 'https://locationiq.org';
  query.key = '93a4e4e1cf3f0c'; // This is my personal apikey.
  query.format = 'json';
  // request package is capable of setting headers and status for response and automatically handle errors by stream piping.
  req.pipe(request({ method, baseUrl, headers, uri: path, qs: query })).pipe(res);
});

// Initilize the main app instance, apply the global midwares, mount locationiqApp
const app = express()
  .use(morgan('tiny'))
  .use(responseTime())
  .use('/locationiq', locationiqApp);

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
