const express = require('express');
const path = require('path');
const http = require('http');
const port = process.env.PORT || 3000;
const socket = require('socket.io');
const { resolve } = require('path');
const chat = require(path.join(__dirname, 'db/chat_v2_db.js'))

const app = express();
const server = http.createServer(app);
const io = socket(server, { cors: { origin: '*', } });


server.listen(port, () => {
    console.log("Server listening at port %d", port);
});

app.post('/api/user/login', (req, response) => {

    // console.log(req.query)
    let payload = {
        account: req.query.account,
        password: req.query.password,
        name: req.query.name,
        mail: req.query.mail
    }

    // console.log(payload)
    chat.addUser(payload).then(ans => {
        if (ans) {
            response.send({ status: true })
        }
    }).catch(err => {
        console.log(err);
    })

});


