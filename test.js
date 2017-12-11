/**
 * BDD Functionality Test
 */
const t = require('tap');
const axios = require('axios');
const http = require('http');
const https = require('https');

const axiosBaseOption = {
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true, rejectUnauthorized: false }),
  responseType: 'text',
  validateStatus: status => true
};

const filterHeaders = (...headersArray) =>
  headersArray.map(headers =>
    Object.keys(headers)
      .filter(k => ['cf-ray', 'date', 'cookie'].every(word => !k.includes(word)))
      .map(k => ({ [k]: headers[k] }))
      .reduce((rv, x) => Object.assign(rv, x), {})
  );

t.test('LocationIQ should have exactly the same response with successful requests.', async t => {
  const [localRes, remoteRes] = await Promise.all([
    axios({
      url: `https://localhost:3000/locationiq/v1/balance.php`,
      ...axiosBaseOption
    }),
    axios({
      url: `https://locationiq.org/v1/balance.php?key=93a4e4e1cf3f0c&format=json`,
      ...axiosBaseOption
    })
  ]);
  t.equal(localRes.status, remoteRes.status, 'status code should be the same');
  t.equal(localRes.statusText, remoteRes.statusText, 'status message should be the same');
  t.same(localRes.data, remoteRes.data, 'body should be the same');
  t.equal(localRes.headers.length, remoteRes.headers.length, 'headers should have the same size');
  t.same(
    ...filterHeaders(localRes.headers, remoteRes.headers),
    'static headers values should be the same'
  );
});

t.test('LocationIQ should have exactly the same response with falure requests.', async t => {
  const [localRes, remoteRes] = await Promise.all([
    axios({
      url: `https://localhost:3000/locationiq/v1/balance.p`,
      ...axiosBaseOption
    }),
    axios({
      url: `https://locationiq.org/v1/balance.p`,
      ...axiosBaseOption
    })
  ]);
  t.equal(localRes.status, remoteRes.status, 'status code should be the same');
  t.equal(localRes.statusText, remoteRes.statusText, 'status message should be the same');
  t.same(localRes.data, remoteRes.data, 'body should be the same');
  t.equal(localRes.headers.length, remoteRes.headers.length, 'headers should have the same size');
  t.same(
    ...filterHeaders(localRes.headers, remoteRes.headers),
    'static headers values should be the same'
  );
});
