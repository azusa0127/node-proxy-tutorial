/**
 * 4 - Moving into frameworks for convenience.
 * https://expressjs.com/
 * http://koajs.com/
 */
const https = require('https'); // Built-in https module.
const fs = require('fs'); // Built-in filesystem module.
const express = require('express'); // Expressjs server framework.
// A sub-application later mount to /hello
const helloApp = express().use((req, res) => {
  const { method, baseUrl, url, path, params, query, headers, body } = req;
  console.log({ method, baseUrl, url, path, params, query, headers, body });
  res.send('Hello from express');
});
// A sub-application later mount to /bye
const byeApp = express().use((req, res) => res.send('Byebye express.'));
// Initilize the main Express app instance and mount the sub apps.
const app = express()
  .use('/hello', helloApp)
  .use('/bye', byeApp);
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
