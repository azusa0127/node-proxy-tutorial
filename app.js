/**
 * A simple proxy service that can transform request under the hood.
 *
 * Copyright (c) 2017 Phoenix
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const Koa = require('koa');
const mount = require('koa-mount');
const KoaLogger = require('koa-logger');
const axios = require('axios');
const headerCase = require('header-case');

const CONFIGS = JSON.parse(fs.readFileSync('config.json'));

const axiosBaseOption = {
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true, rejectUnauthorized: false }),
  responseType: 'stream',
  validateStatus: status => true
};

const processResponseHeaders = headers => {
  const rv = {};
  Object.keys(headers).forEach(k => {
    if (!k.includes('cookie')) rv[headerCase(k)] = headers[k];
  });
  return rv;
};

const proxy = ({ prefix, baseUrl, query = {}, headers = {} }) =>
  mount(
    prefix,
    new Koa().use(async (ctx, next) => {
      await next();
      const remoteReqOption = {
        baseURL: baseUrl,
        method: ctx.method,
        url: ctx.path,
        headers: { ...ctx.headers, ...headers },
        params: { ...ctx.query, ...query },
        ...axiosBaseOption
      };
      if (remoteReqOption.headers.host) delete remoteReqOption.headers.host;
      const res = await axios(remoteReqOption);
      ctx.response.status = res.status;
      ctx.response.message = res.statusText;
      ctx.response.set(processResponseHeaders(res.headers));
      ctx.body = res.data;
    })
  );

const app = new Koa().use(KoaLogger());
CONFIGS.forEach(conf => app.use(proxy(conf)));

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
