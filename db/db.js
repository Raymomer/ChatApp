var mysql = require('mysql');
var randomstring = require("randomstring");


// check database ,usersTable ,roomsTable exits

// push a public room to roomsTable and create a public_Message



var dbConfig = {
    host: "127.0.0.1",
    user: 'root',
    password: "",
    database: 'chatapp',
}

const con = mysql.createConnection(dbConfig);

async function dbStart() {


    let dbPromise = new Promise((resolve, reject) => {

        con.connect(function (err) {

            if (err) throw err;
            let sql = "CREATE DATABASE chatapp"

            con.query(sql, (err, result) => {
                if (err) {
                    if (err.errno != 1007) {
                        throw err;
                    }
                }
                // console.log("Database created!");


                // enter chatapp database 
                con.changeUser({
                    database: 'chatapp'
                }, (err) => {
                    if (err) throw err;


                    sql =
                        `
                        CREATE TABLE if not exists users (
                            id          int(20)      NOT NULL AUTO_INCREMENT PRIMARY KEY,
                            token       varchar(255) , 
                            account     varchar(255) NOT NULL, 
                            password    varchar(255)  NOT NULL,     
                            mail        varchar(255)  NOT NULL, 
                            create_at   timestamp,
                            UNIQUE KEY(account)
                    )
                    `
                    con.query(sql, function (err, result) {
                        if (err) throw err;
                        // console.log("User's table created");
                    });


                    // check rooms exist
                    sql =
                        ` 
                        CREATE TABLE if not exists rooms (
                            room_id			varchar(20)     NOT NULL PRIMARY KEY,
                            room_name       varchar(10)     NOT NULL,
                            menbers 		varchar(255)    NOT NULL,
                            create_at       timestamp       NOT NULL
                    )`

                    con.query(sql, function (err, result) {
                        if (err) throw err;
                        // console.log("Rooms's Table created");
                    });


                    // Try to creat a public room
                    sql =
                        `
                        SELECT * FROM rooms 
                        `

                    con.query(sql, function (err, result, fields) {

                        if (err) throw err;

                        // auto create a public room
                        if (result.length == 0) {
                            addRoom("PUBLIC", "all")
                        }

                    });

                    sql =
                        ` 
                        CREATE TABLE if not exists messages (
                            room_id     varchar(20)      NOT NULL,
                            user_id     varchar(20)      NOT NULL,
                            message     varchar(255)     NOT NULL,
                            create_at   dateTime         NOT NULL
                    )`
                    con.query(sql, function (err, result) {

                        if (err) throw err;
                        // console.log("CREATE MESSAGES !")

                        resolve();
                    });



                })





            });



        })
    })

    await dbPromise
    return


}


function addRoom(roomName, menbers) {



    var createTime = setLocalTime();
    var room_id = randomstring.generate({
        length: 15,
    });

    var sql = "INSERT INTO rooms (room_id ,room_name, menbers ,create_at) VALUES ('" + room_id + "', '" + roomName + "','" + menbers + "','" + createTime + "')";

    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("INSERT A NEW ROOM =>", room_id);
    })

}

function addUser(profile) {
    // function addUser() {

    return new Promise((resolve, reject) => {
        var createTime = setLocalTime();
        var sql = "INSERT INTO users (account ,password, mail,create_at) VALUES ('" + profile.account + "','" + profile.password + "','" + profile.mail + "','" + createTime + "')";


        con.query(sql, function (err, result) {
            if (err) throw reject();

            console.log("INSERT A NEW USER => ", profile);
        })
    })


    // console.log(createTime);
}

function listUser() {

    return new Promise((resolve, reject) => {
        var sql = `SELECT * FROM users`

        con.query(sql, function (err, rows, fields) {

            if (err) throw err;
            const result = Object.values(JSON.parse(JSON.stringify(rows)));
            // console.log(result)

            resolve(result)

        })

    })


}

function ckeckUserExist(user_account) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT * FROM users WHERE account =  '" + user_account + "'";

        con.query(sql, function (err, rows) {
            var result = Object.values(JSON.parse(JSON.stringify(rows)));
            if (result.length > 0) {

                resolve(result)
            } else {
                reject("Can't not found user's account.")
            }
        })
    })

}

function checkRoomExist(userId) {

    return new Promise((resolve, reject) => {
        var sql = "SELECT * FROM rooms WHERE room_id = '" + userId + "'";

        con.query(sql, function (err, result) {
            console.log(result)


            if (result.length > 0) {
                resolve()
            } else {
                reject("Can't not found roomId.")
            }
        })
    })


}

function addMessage(user_account, roomId, msg) {

    return new Promise((resolve, reject) => {
        var date = new Date();
        var createTime = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

        Promise.all([checkRoomExist(roomId), ckeckUserExist(user_account)]).then(res => {
            console.log("CHECK DONE")

            var sql = "INSERT INTO messages (room_id ,user_id ,message ,create_at) VALUES ('" + roomId + "','" + user_account + "','" + msg + "','" + createTime + "')";

            con.query(sql, function (err, result) {
                if (err) throw err;

                console.log("INSERT A MESSAGE msg =>", msg);
                resolve(msg)
            })


        }).catch(err => {
            reject();
        })
    })


}


function setLocalTime() {

    var date = new Date();
    var createTime = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();


    return createTime
}

function listRoomMsg(roomId) {

    return new Promise((resolve, reject) => {
        var sql = "SELECT * FROM messages WHERE room_id =  '" + roomId + "'";

        con.query(sql, function (err, rows, fields) {
            var result = Object.values(JSON.parse(JSON.stringify(rows)));

            resolve(result)
        })
    })

}

function getRoomId(roomName) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT * FROM rooms WHERE room_name = '" + roomName + "'";

        con.query(sql, function (err, rows, fields) {
            var result = Object.values(JSON.parse(JSON.stringify(rows)));
            if (result.length > 0) {
                resolve(result)
            } else {
                reject("Can't not found room")
            }

        })
    })
}


function init() {

    dbStart().then(res => {
        // addUser({
        //     account: "ray2",
        //     password: "aa1234",
        //     mail: "elva9007790@gmail.com"
        // })

        // listUser()
        // for (let i = 0; i < 5; i++) {
        //     addMessage('ray1', 'LY2wFlSEbp9GNyj', "Say" + i);
        // }

        // listRoomMsg('hwKwvfa59aNKmfH');
        addRoom('巨捶瑞斯', "all")

    })

}

function test() {
    return ("Test");
}

// dbStart();
// init()

module.exports = { addRoom, addUser, listUser, addMessage, listRoomMsg, test, getRoomId, ckeckUserExist }