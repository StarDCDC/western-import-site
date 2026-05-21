const http = require('http'); http.createServer((req, res) => { res.end('Test works!'); }).listen(3001); console.log('Test server on port 3001');
