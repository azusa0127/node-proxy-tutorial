/**
 * 7 - Clean up, tweak, Generalize.
 */
const https = require('https'); // Built-in https module.
const fs = require('fs'); // Built-in filesystem module.
const Koa = require('koa'); // koa.js server framework.
const mount = require('koa-mount'); // A router middleware for koa.
const KoaLogger = require('koa-logger'); // Logger middleware for koa.
const request = require('request'); // A convenient http request package.

// A static configuration that can be extracted into json config file.
const CONFIGS = [
  {
    prefix: '/locationiq',
    baseUrl: 'https://locationiq.org',
    query: { key: '93a4e4e1cf3f0c', format: 'json' },
    headers: {}
  }
];
// Initilize the Koa app instance with logger middleware;
const app = new Koa().use(KoaLogger());
// Iterate and mount proxy applications specified in CONFIGS.
for (const { prefix, baseUrl, query = {}, headers = {} } of CONFIGS) {
  app.use(
    mount(
      prefix,
      new Koa().use(async ctx => {
        const remoteReqOption = {
          baseUrl,
          method: ctx.method,
          uri: ctx.path,
          headers: { ...ctx.headers, ...headers },
          qs: { ...ctx.query, ...query }
        };
        if (remoteReqOption.headers.host) delete remoteReqOption.headers.host;
        ctx.body = ctx.req
          .pipe(request(remoteReqOption))
          .once('response', resp => {
            // Setting the headers
            ctx.response.status = resp.statusCode;
            ctx.response.message = resp.statusMessage;
            ctx.response.set(resp.headers);
          })
          .on('error', ctx.onerror);
      })
    )
  );
}

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
