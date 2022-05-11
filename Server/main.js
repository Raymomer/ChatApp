const http = require('http');
const express = require('express');
const app = express();

app.get('/', function (req, res) {
    res.type('text/plain');
    res.status(200).send('Hello, World.');
})

server = http.createServer(app)
server.listen(8001, () => {
    console.log('Express started')
})