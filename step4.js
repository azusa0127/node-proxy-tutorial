/**
 * 4 - Moving into frameworks for convenience.
 * https://expressjs.com/
 * http://koajs.com/
 */
const https = require('https'); // Built-in https module.
const fs = require('fs'); // Built-in filesystem module.
const Koa = require('koa'); // koa.js server framework.
const mount = require('koa-mount'); // A router middleware for koa.

// A sub-application later mount to /hello
const helloApp = new Koa().use(async ctx => {
  const { protocol, method, headers, host, origin, path, search, url, query } = ctx.request;
  console.log({ protocol, method, headers, host, origin, path, search, url, query });
  ctx.body = 'Hello Koa.';
});
// A sub-application later mount to /bye
const byeApp = new Koa().use(async ctx => {
  ctx.body = 'Bye Koa.';
});

// Initilize the Koa app instance and mount the sub apps.
const app = new Koa().use(mount('/hello', helloApp)).use(mount('/bye', byeApp));
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
