/**
 * 5 - Echo serverce and middlewares.
 */
const https = require('https'); // Built-in https module.
const fs = require('fs'); // Built-in filesystem module.
const Koa = require('koa'); // koa.js server framework.
const mount = require('koa-mount'); // A router middleware for koa.
const KoaLogger = require('koa-logger'); // Logger middleware for koa.
const KoaBodyparser = require('koa-bodyparser'); // Body parsing middleware for koa.

// The sub-application later mount at /echo
const echoApp = new Koa().use(KoaBodyparser()).use(async ctx => {
  const { protocol, method, headers, host, origin, path, search, url, query, body, rawBody } = ctx.request;
  // Echo the request details in json response.
  ctx.type = 'json';
  ctx.body = { protocol, method, headers, host, origin, path, search, url, query, body, rawBody };
});
// Initilize the main app instance, apply the global midwares, mount echo
const app = new Koa().use(KoaLogger()).use(mount('/echo', echoApp));
// Initialize a https server.
https
  .createServer(
    {
      cert: fs.readFileSync('cert/server.crt'),
      key: fs.readFileSync('cert/server.key')
    },
    app.callback()
  )
  .listen(3000);

console.log('koa is now listening at https://localhost:3000');
