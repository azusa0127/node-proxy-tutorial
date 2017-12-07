/**
 * 5 - Echo serverce and middlewares.
 */
const https = require('https'); // Built-in https module.
const fs = require('fs'); // Built-in filesystem module.
const express = require('express'); // Expressjs server framework.
// Import some middlewares.
const responseTime = require('response-time'); // Response-time header middleware for expressjs.
const morgan = require('morgan'); // Logger middleware for expressjs.
const bodyParser = require('body-parser'); // Body parser middleware for retrieving request body.

// The sub-application later mount at /echo
const echoApp = express().use(
  // Use body parser middleware for echoApp only.
  bodyParser.json(),
  bodyParser.urlencoded({ extended: true }),
  bodyParser.text({ type: 'text/*' }),
  (req, res) => {
    const { method, baseUrl, url, path, params, query, headers, body } = req;
    // Echo the request details in json response.
    res.type('json');
    res.send({ method, baseUrl, url, path, params, query, headers, body });
  }
);
// Initilize the main app instance, apply the global midwares, mount echo
const app = express()
  .use(morgan('tiny'))
  .use(responseTime())
  .use('/echo', echoApp);
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
