const socket = io.connect();
const base_url = "http://localhost:3000"
const rooms = {};

function Submit() {
    account = $("#input_acocunt").val();

    const users =
    {
        account: account,
        password: "aa1234",
        mail: "ray12"
    }


    socket.emit('new-user', users)

}

function SubMsg() {

    // roomName = $("#input_room").val();
    user = $("#input_acocunt").val();
    msg = $('#input_msg').val();
    if (!rooms['current_roomId'])
        return;

    socket.emit("sendMessage", {
        account: user,
        roomId: rooms['current_roomId'],
        message: msg
    })



}

function SubJoin() {
    roomName = $("#input_room").val();
    socket.emit('join-room', roomName)


    // socket.emit('join-room', rooms['current_roomId'])

}

socket.on('update-user', data => {
    console.log(data);
})

socket.on('take-roomId', data => {
    // console.log(data)
    rooms['current_roomId'] = data

    console.log(rooms)
})


socket.on('update-messsage', payload => {

    if (payload['roomId'] == rooms['current_roomId']) {
        let html = "<p>" + payload.account + ": " + payload.msg + "</p>"
        document.getElementsByClassName('msg')[0].innerHTML += html
    }

})

socket.on('list-roomMessage', payload => {
    document.getElementsByClassName('msg')[0].innerHTML = ""
    payload.forEach(row => {
        let html = "<p>" + row['user_id'] + ": " + row['message'] + "</p>"
        document.getElementsByClassName('msg')[0].innerHTML += html
    });

})
