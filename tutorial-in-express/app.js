/**
 * A simple request forwarding service tha can transform request under the hood.
 *
 * Copyright (c) 2017 Phoenix
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

const https = require('https');
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const request = require('request');

const CONFIGS = JSON.parse(fs.readFileSync('config.json'));

const app = express().use(morgan('tiny'));

for (const { prefix, baseUrl, query = {}, headers = {} } of CONFIGS) {
  app.use(
    prefix,
    express().use((req, res) => {
      const remoteReqOption = {
        baseUrl,
        method: req.method,
        uri: req.path,
        headers: { ...req.headers, ...headers },
        qs: { ...req.query, ...query }
      };
      if (remoteReqOption.headers.host) delete remoteReqOption.headers.host;

      req.pipe(request(remoteReqOption)).pipe(res);
    })
  );
}

https
  .createServer(
    {
      cert: fs.readFileSync('cert/server.crt'),
      key: fs.readFileSync('cert/server.key')
    },
    app
  )
  .listen(3000);

console.log('express is now listening at https://localhost:3000');
