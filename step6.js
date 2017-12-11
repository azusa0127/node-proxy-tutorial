/**
 * 6 - Replicate the request and forward to remote server with request package.
 */
const https = require('https'); // Built-in https module.
const fs = require('fs'); // Built-in filesystem module.
const Koa = require('koa'); // koa.js server framework.
const mount = require('koa-mount'); // A router middleware for koa.
const KoaLogger = require('koa-logger'); // Logger middleware for koa.
const axios = require('axios'); // A convenient http request package.

// A proxy application later to be mounted.
const locationiqApp = new Koa().use(async ctx => {
  // Print the request properties for debugging.
  const { method, headers, path, query, rawBody } = ctx.request;
  console.log({ method, headers, path, query, rawBody });
  // Remove the old host header as we are forwarding request.
  delete headers.host;
  // Lets forward the request to LocationIQ API https://locationiq.org/ with added infomation.
  const baseUrl = 'https://locationiq.org';
  query.key = '93a4e4e1cf3f0c'; // This is my personal apikey.
  query.format = 'json';
  // Use request package for convinient remote request.
  const res = await axios({
    baseURL: baseUrl,
    url: path,
    params: query,
    data: rawBody,
    // For proxy purpose, we don't want to parse the response body, so change it to buffer.
    responseType: 'arraybuffer',
    // This is needed when requesting server with invalid SSL cert.
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    // For proxy purpoe, we don't want the request to fail at any status.
    validateStatus: status => true
  });
  // Forward the response status and headers along with body.
  ctx.response.status = res.status;
  ctx.response.message = res.statusText;
  ctx.response.set(res.headers);
  ctx.body = res.data;
});
// Initilize the Koa app instance with logger and mount locationiqApp to /locationiq.
const app = new Koa().use(KoaLogger()).use(mount('/locationiq', locationiqApp));
// Initialize a https server.
https
  .createServer(
    {
      cert: fs.readFileSync('cert/server.crt'),
      key: fs.readFileSync('cert/server.key')
    },
    app.callback() // Use the Koa app as requests listener.
  )
  .listen(3000);

console.log('koa is now listening at https://localhost:3000');
