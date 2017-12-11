/**
 * 3 - Request analysis and basic routing.
 * https://nodejs.org/api/http.html#http_class_http_incomingmessage
 */
const https = require('https'); // Built-in https module.
const fs = require('fs'); // Built-in filesystem module.

// Initialize a https server.
https
  .createServer(
    {
      cert: fs.readFileSync('cert/server.crt'),
      key: fs.readFileSync('cert/server.key')
    },
    (req, res) => {
      // Demostrate the request properties in console.
      const { method, url, headers } = req;
      console.log({ method, url, headers });
      // Basic routing conditionals.
      if (/^\/hello/.test(url)) {
        res.end('Hello from node.js'); // GET /hello*
      } else if (url.startsWith('/bye')) {
        res.end('Bye bye from node.js'); // GET /bye*
      } else {
        res.statusCode = 404; // Any other path.
        res.end();
      }
    }
  )
  .listen(3000);

console.log('node.js is now listening at https://localhost:3000');
