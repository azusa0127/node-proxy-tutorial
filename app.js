/**
 * A simple proxy service that can transform request under the hood.
 *
 * Copyright (c) 2017 Phoenix
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
const https = require('https');
const fs = require('fs');
const Koa = require('koa');
const mount = require('koa-mount');
const KoaLogger = require('koa-logger');
const request = require('request');

const CONFIGS = JSON.parse(fs.readFileSync('config.json'));

const app = new Koa().use(KoaLogger());
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
          qs: { ...ctx.query, ...query },
        };
        if (remoteReqOption.headers.host) delete remoteReqOption.headers.host;
        ctx.body = ctx.req.pipe(request(remoteReqOption)).once('response', resp => {
          ctx.response.status = resp.statusCode;
          ctx.response.message = resp.statusMessage;
          ctx.response.set(resp.headers);
        });
      }),
    ),
  );
}

https
  .createServer(
    {
      cert: fs.readFileSync('cert/server.crt'),
      key: fs.readFileSync('cert/server.key'),
    },
    app.callback(),
  )
  .listen(3000);

console.log('koa is now listening at https://localhost:3000');
