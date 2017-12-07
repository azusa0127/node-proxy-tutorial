/**
 * 1 - Hello world.
 */
const http = require('http'); // Built-in http module.

http
  .createServer((req, res) => {
    res.end('Hello from Node.js'); // .end() for completing a stream.
  })
  .listen(3000);

console.log('node.js is now listening at http://localhost:3000');
