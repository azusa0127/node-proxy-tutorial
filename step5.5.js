/**
 * 5.5 - Making http request with axios
 * https://github.com/axios/axios
 */
const https = require('https'); // Built-in https module.
const axios = require('axios'); // A convenient http request package.

axios({
  // Standard request options,
  method: 'POST',
  headers: { accept: 'application/json' },
  baseURL: 'https://localhost:3000',
  url: '/echo',
  params: { q: 'ABC' },
  data: `I'm a POST body...`,
  // For proxy purpose, we don't want to parse the response body, so change it to buffer.
  responseType: 'arraybuffer',
  // This is needed when requesting server with invalid SSL cert.
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  // For proxy purpoe, we don't want the request to fail at any status.
  validateStatus: status => true
})
  .then(res => {
    // Check the response data in a glance.
    const { status, statusText, headers, data } = res;
    console.log({ status, statusText, headers, data: data.toString() });
  })
  .catch(err => console.error(err));
