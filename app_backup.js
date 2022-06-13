/// iwefbiewfubwifubewfiufbewiufb
const express = require('express');
const path = require('path');
const http = require('http');
const port = process.env.PORT || 3000;
const socket = require('socket.io');
const { resolve } = require('path');
const db = require(path.join(__dirname, 'db/db.js'))

const app = express();
const server = http.createServer(app);
const io = socket(server, { cors: { origin: '*', } });

app.use(express.static(path.join(__dirname, 'public')));


server.listen(port, () => {
    console.log("Server listening at port %d", port);
});


io.on('connection', async function (socket) {

    socket.on("new-user", payload => {

        console.log("Get Message")

        db.addUser(payload)

        db.listUser().then(res => {
            console.log("Deal")
            io.emit('update-user', res)
        })


    })


    socket.on('sendMessage', payload => {
        db.addMessage(payload.account, payload.roomId, payload.message).then(res => {
            console.log(res);
            socket.to(payload.roomId).emit('room-message', {
                account: payload.account,
                roomId: payload.roomId,
                message: res,
            })


        })
    })


    socket.on('join-room', async payload => {

        Promise.all([db.getRoomId(payload.roomName), db.ckeckUserExist(payload.account)]).then(res => {
            let check = true;
            res.filter(row => {
                if (row.length == 0) check = false
            })

            let response = {
                roomId: res[0][0].room_id,
                account: res[1][0].account
            }

            socket.join(response.roomId);
            socket.to(response.roomId).emit('room-welcome', {
                roomId: response.roomId,
                message: 'welcome',
            })

            db.listRoomMsg(response.roomId).then(res => {

                response['messages'] = res
                console.log(response)
                socket.emit('success-join', response)
            })


        }).catch(err => {
            console.log(err)
        })

    })

    socket.on("leave-room", payload => {

        socket.leave(payload.roomId)
    })


});




