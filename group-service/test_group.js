const http = require('http');

const data = JSON.stringify({ name: "Miami Trip", createdBy: "testuser123" });

const options = {
  hostname: '127.0.0.1',
  port: 3003,
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => { body += d; });
  res.on('end', () => console.log('Response:', body));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
