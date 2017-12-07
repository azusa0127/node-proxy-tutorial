/**
 * 6 - Replicate the request and forward to remote server.
 */
const https = require('https'); // Built-in https module.
const fs = require('fs'); // Built-in filesystem module.
const express = require('express'); // Expressjs server framework.
// Import some middlewares.
const responseTime = require('response-time'); // Response-time header middleware for expressjs.
const morgan = require('morgan'); // Logger middleware for expressjs.
// Url formatting helper
const { format } = require('url');

// The sub-application later mount at /locationiq
const locationiqApp = express().use((req, res) => {
  // Print the request properties for debugging.
  const { method, baseUrl, url, path, params, query, headers, body } = req;
  console.log('req: ', { method, baseUrl, url, path, params, query, headers, body });
  // Lets forward the request to LocationIQ API https://locationiq.org/
  headers.host = 'locationiq.org';
  query.key = '93a4e4e1cf3f0c'; // This is my personal apikey.
  query.format = 'json';
  // As we are not processing body as all, will use stream piping to forward the body content.
  req.pipe(
    https.request(
      {
        method,
        headers,
        host: headers.host,
        path: format({ pathname: path, query })
      },
      resp => {
        // Set the response header and status before sending the body.
        res.set(resp.headers);
        res.statusCode = resp.statusCode;
        res.statusMessage = resp.statusMessage;
        // Pipe the body with a naive error handler.
        resp.pipe(res).on('error', error => res.status(500).send({ error }));
      }
    ) // No .end() is needed as piped streams negotiate automaticlaly.
  );
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
