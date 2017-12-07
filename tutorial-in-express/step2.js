/**
 * 2 - HTTPS.
 */
const https = require('https'); // Built-in https module.
const fs = require('fs'); // Built-in filesystem module.

https
  .createServer(
    {
      cert: fs.readFileSync('cert/server.crt'),
      key: fs.readFileSync('cert/server.key')
    },
    (req, res) => {
      res.end('Hello from Node.js');
    }
  )
  .listen(3000);

console.log('node.js is now listening at https://localhost:3000');
