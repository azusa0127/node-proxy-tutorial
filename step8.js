/**
 * 8 - Midware extraction and final tweak.
 */
const http = require('http'); // Built-in http module.
const https = require('https'); // Built-in https module.
const fs = require('fs'); // Built-in filesystem module.
const Koa = require('koa'); // koa.js server framework.
const mount = require('koa-mount'); // A router middleware for koa.
const KoaLogger = require('koa-logger'); // Logger middleware for koa.
const axios = require('axios'); // A convenient http request package.
const headerCase = require('header-case'); // Header case a string.

// A static configuration that can be extracted into json config file.
const CONFIGS = [
  {
    prefix: '/locationiq',
    baseUrl: 'https://locationiq.org',
    query: { key: '93a4e4e1cf3f0c', format: 'json' },
    headers: {}
  }
];
// Extract the static object and function options out to avoid useless copies.
const httpAgent = new http.Agent({ keepAlive: true }); // keep connection open.
const httpsAgent = new https.Agent({ keepAlive: true, rejectUnauthorized: false });
const validateStatus = status => true;

// Change the headers keys back to Header-Case, eliminate cookie information.
const processResponseHeaders = headers => {
  const rv = {};
  Object.keys(headers).forEach(k => {
    if (!k.includes('cookie')) rv[headerCase(k)] = headers[k];
  });
  return rv;
};

// The proxy middleware extracted.
const proxy = ({ prefix, baseUrl, query = {}, headers = {} }) =>
  mount(
    prefix,
    new Koa().use(async (ctx, next) => {
      await next(); // Always calls await next() in midware, otherwise it may break the chain.
      const remoteReqOption = {
        baseURL: baseUrl,
        method: ctx.method,
        url: ctx.path,
        headers: { ...ctx.headers, ...headers },
        params: { ...ctx.query, ...query },
        responseType: 'stream', // This will response with the stream piped directly into ctx.body.
        httpAgent,
        httpsAgent,
        validateStatus
      };
      if (remoteReqOption.headers.host) delete remoteReqOption.headers.host;
      const res = await axios(remoteReqOption);
      // Forward the response status and headers along with body.
      ctx.response.status = res.status;
      ctx.response.message = res.statusText;
      ctx.response.set(processResponseHeaders(res.headers));
      ctx.body = res.data;
    })
  );

// Initilize the Koa app instance with logger middleware;
const app = new Koa().use(KoaLogger());
// Iterate and mount proxy applications specified in CONFIGS.
CONFIGS.forEach(conf => app.use(proxy(conf)));

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
