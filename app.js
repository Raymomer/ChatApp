const express = require('express');
const path = require('path');
const http = require('http');
const port = process.env.PORT || 3000;
const socket = require('socket.io');
const { resolve } = require('path');
const db = require(path.join(__dirname, 'db/db.js'))

const app = express();
const server = http.createServer(app);
const io = socket(server);

app.use(express.static(path.join(__dirname, 'public')));


server.listen(port, () => {
    console.log("Server listening at port %d", port);
});


io.on('connection', async function (socket) {

    socket.on("new-user", (payload) => {

        console.log("Get Message")

        db.addUser(payload)

        db.listUser().then(res => {
            console.log("Deal")
            io.emit('update-user', res)
        })
        // console.log("123");


    })


    socket.on('sendMessage', payload => {
        db.addMessage(payload.account, payload.roomId, payload.message).then(res => {
            console.log(res);

            io.emit('update-messsage', {
                account: payload.account,
                roomId: payload.roomId,
                msg: res
            })
        })
    })



    socket.on('join-room', roomName => {
        db.getRoomId(roomName).then(res => {
            // console.log(res[0].room_id)
            let roomId = res[0]['room_id']

            socket.emit('take-roomId', roomId);

            socket.join(roomId)

            console.log(socket.rooms)

            db.listRoomMsg(roomId).then(rows => {
                console.log("Message =>", rows)
                // socket.emit('list-roomMessage', rows)
                io.to(roomId).emit('list-roomMessage', rows)

            })


        });;


    })

});




