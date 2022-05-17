var mysql = require('mysql');
var randomstring = require("randomstring");


// check database ,usersTable ,roomsTable exits

// push a public room to roomsTable and create a public_Message



var dbConfig = {
    host: "127.0.0.1",
    user: 'root',
    password: "",
    database: 'chatapp_v2',
}

const con = mysql.createConnection(dbConfig);

function listMessage(payload) {

    return new Promise((resolve, reject) => {
        checkTokenExist(payload.token).then(async user_pid => {

            let check = await checkUserPidExist(payload.receiver_pid)
            if (check && user_pid) {



                let sql = "SELECT * FROM message  WHERE (user_pid  = '" + user_pid +
                    "' AND receiver_pid = '" + payload.receiver_pid +
                    "') OR (user_pid = '" + payload.receiver_pid + "' AND receiver_pid = '"
                    + user_pid + "')";

                con.query(sql, (err, rows, fields) => {
                    if (err) throw reject(err);

                    resolve(rows);
                })


            }

        })
    })

};

function addUser(payload) {

    return new Promise((resolve, reject) => {
        var currentTime = setLocalTime();
        var pid = pk();

        payload["pid"] = pid;
        payload["create_at"] = currentTime;
        payload["update_at"] = currentTime;
        payload["status"] = 1;

        let inputSql = sqlFormmatSet(payload);

        var sql = "INSERT INTO user " + inputSql;

        con.query(sql, function (err, result) {
            if (err) throw reject(err);

            let data = {
                user_pid: payload.pid,
                token: null
            }
            updateToken(data).then(res => {
                resolve(true)
            }).catch(err => {
                reject(err)
            })


        })
    })
};

function updateToken(payload) {
    return new Promise((resolve, reject) => {
        // let inputSql = sqlFormmatSet(payload)
        let sql = "SELECT * FROM usertoken WHERE user_pid = '" + payload.user_pid + "'";
        con.query(sql, (err, rows, fields) => {

            let sql = ""
            if (err) throw reject(err);

            if (rows.length > 0) {
                sql = "UPDATE usertoken SET token = '" + payload.token + "' WHERE user_pid = '" + payload.user_pid + "'";
            } else {

                let inputSql = sqlFormmatSet(payload);
                sql = "INSERT INTO usertoken " + inputSql;
            }

            con.query(sql, (err, result) => {
                if (err) throw reject(err);
                resolve(result);
            })
        })


    })
}


function listAllUser(payload) {
    return new Promise((resolve, reject) => {

        checkTokenExist(payload.token).then(pid => {
            let sql = "SELECT pid ,name FROM user WHERE pid != '" + pid + "'";
            con.query(sql, (err, rows, fields) => {
                var result = Object.values(JSON.parse(JSON.stringify(rows)));
                resolve(result);
            })

        })

    })
}


function listUserFriend(payload) {
    return new Promise((resolve, reject) => {
        checkTokenExist(payload.token).then(user_pid => {
            let sql = "SELECT friend_pid FROM relateship WHERE user_pid = '" + user_pid + "'";
            con.query(sql, (err, rows, fields) => {
                if (err) throw reject(err);
                var userFriends = Object.values(JSON.parse(JSON.stringify(rows)));

                let ans = []

                userFriends.forEach(data => {
                    sql = "SELECT pid ,name FROM user WHERE pid = '" + data.friend_pid + "'";
                    console.log(sql);
                    con.query(sql, (err, rows, fields) => {
                        if (err) throw reject(err);
                        var result = Object.values(JSON.parse(JSON.stringify(rows)));

                        ans.push(result[0])

                        if (userFriends.length == ans.length) {
                            resolve(ans);
                        }

                    })
                })

            })
        })
    })
}


function loginUser(payload) {


    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM user WHERE account = ' + payload.account + ' AND password = ' + payload.password;
        con.query(sql, (err, rows, fields) => {
            if (err) throw reject(err);
            var result = Object.values(JSON.parse(JSON.stringify(rows)));

            if (result.length > 0) {

                updateToken({
                    user_pid: result[0].pid,
                    token: pk()
                }).then(res => {
                    resolve(true);
                }).catch(err => {
                    reject(err);
                })




            }
            resolve(false);


        });
    });
}

function logoutUser(payload) {

    return new Promise((resolve, reject) => {
        checkTokenExist(payload.token).then(user_pid => {
            if (user_pid) {
                updateToken({
                    user_pid: user_pid,
                    token: null
                })
                resolve(true)
            }
            resolve(false)
        })
    })
}

function checkAccountExist(payload) {

    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM user WHERE account = ' + payload.account;

        con.query(sql, (err, rows, fields) => {
            if (err) throw reject(err);
            var result = Object.values(JSON.parse(JSON.stringify(rows)));
            resolve(result);
        });

    });

}

function checkUserPidExist(pid) {

    return new Promise((resolve, reject) => {

        let sql = "SELECT * FROM user WHERE pid = '" + pid + "'";
        console.log(sql)
        con.query(sql, (err, rows, fields) => {
            if (err) throw reject(err);
            var result = Object.values(JSON.parse(JSON.stringify(rows)));

            if (result.length > 0) {
                resolve(true);
            }
            resolve(false)
        });
    });
}

function checkTokenExist(token) {
    return new Promise((resolve, reject) => {

        let sql = "SELECT * FROM usertoken WHERE token = '" + token + "'";

        con.query(sql, (err, rows, fields) => {
            if (err) throw reject(err);
            var result = Object.values(JSON.parse(JSON.stringify(rows)));

            if (result.length > 0) {
                resolve(result[0].user_pid);
            }
            resolve()
        });
    });
}


function inviteFriend(payload) {

    return new Promise((resolve, reject) => {


        checkTokenExist(payload.token).then(async user_pid => {
            let check = await checkUserPidExist(payload.friend_pid)
            if (check && user_pid) {

                let data = {
                    user_pid: user_pid,
                    friend_pid: payload.friend_pid
                }

                let inputSql = sqlFormmatSet(data);
                var sql = "INSERT INTO relateship " + inputSql;

                con.query(sql, function (err, result) {
                    if (err) throw reject(err);
                    resolve(result);
                });


            }
        })
        // Promise.all([checkUserPidExist(payload.token), checkUserPidExist(payload.friend_pid)]).then(res => {

        //     if (!res.includes(false)) {
        //         let inputSql = sqlFormmatSet(payload);
        //         var sql = "INSERT INTO relateship " + inputSql;

        //         con.query(sql, function (err, result) {
        //             if (err) throw reject(err);
        //             resolve(result);
        //         });
        //     }

        // });
    });
}

function addMessage(payload) {


    return new Promise((resolve, reject) => {

        checkTokenExist(payload.token).then(user_pid => {

            if (user_pid) {

                let data = {
                    user_pid: user_pid,
                    create_at: setLocalTime(),
                    receiver_pid: payload.receiver_pid,
                    content: payload.content,
                }

                let inputSql = sqlFormmatSet(data);
                var sql = "INSERT INTO message " + inputSql;

                con.query(sql, function (err, result) {
                    if (err) throw reject(err);
                    resolve(result);
                });

            } else {
                reject("Not found user's token");
            }
        }).catch(err => {
            console.log(err);
        })


    });
}


function setLocalTime() {

    let date = new Date();
    let createTime = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    return createTime

}


function pk() {
    var token = randomstring.generate({
        length: 15,
    });

    return token;
}

function sqlFormmatSet(json) {

    return "(" + Object.keys(json).join(",") + ") VALUES ('" + Object.values(json).join("','") + "') ";


}

function test() {
    return "123";
}


let addUser_payload =
    [
        {
            account: "123",
            password: "123",
            name: "Ray",
            mail: "elva9007790@gmail.com"

        },
        {
            account: "124",
            password: "123",
            name: "Eric",
            mail: "elva9007790@gmail.com"


        },
        {
            account: "125",
            password: "123",
            name: "Funny",
            mail: "elva9007790@gmail.com"


        },
        {
            account: "126",
            password: "123",
            name: "Tina",
            mail: "elva9007790@gmail.com"


        },

        {
            account: "127",
            password: "123",
            name: "Tracy",
            mail: "elva9007790@gmail.com"


        },
        {
            account: "128",
            password: "123",
            name: "Judy",
            mail: "elva9007790@gmail.com"


        },
    ]


let logoutUser_payload = {
    token: "0h7zA30inwH0PLr"
}

let loginUser_payload = {
    account: "123",
    password: "123"
}

let invite_payload = {
    token: "3vTyWRlu9KLae7L",
    friend_pid: "1TE9TpNNJptrSfS"
}

let message_payload = {
    token: "3vTyWRlu9KLae7L",
    receiver_pid: "8a9QvI7NCL5rJcL",
    content: "武漢萬歲",
}


let listAllUser_payload = {
    token: "3vTyWRlu9KLae7L"
}

let listUserFriend_payload = {
    token: "3vTyWRlu9KLae7L"
}

let listMessage_payload = {
    token: "3vTyWRlu9KLae7L",
    receiver_pid: "8a9QvI7NCL5rJcL",
}


// listAllUser

function init() {

    // addUser function 
    // addUser_payload.forEach(profile => {
    //     addUser(profile).then(res => {
    //         console.log(res)
    //     }).catch(err => {
    //         console.log("err => ", err)
    //     })
    // })

    // loginUser function
    // loginUser(loginUser_payload).then(res => {
    //     console.log(res);
    // }).catch(err => {
    //     console.log(err);
    // });


    // logoutUser function
    // logoutUser(logoutUser_payload).then(res => {
    //     console.log(res);
    // }).catch(err => {
    //     console.log(err);
    // });


    // inviteFriend function 
    // inviteFriend(invite_payload).then(res => {
    //     console.log(res)
    // }).catch(err => {
    //     console.log("err => ", err)
    // })



    // addMessage function
    // addMessage(message_payload).then(res => {
    //     console.log(res)
    // }).catch(err => {
    //     console.log(err)
    // })


    // checkUserExist function
    // checkUserExist({ account: "123" }).then(res => {
    //     console.log(res);
    // }).catch(err => {
    //     console.log(err);
    // });

    // listUser function
    // listAllUser(listAllUser_payload).then(res => {
    //     console.log(res);
    // });

    // listUserFriend function
    // listUserFriend(listAllUser_payload).then(res => {
    //     console.log(res)
    // })

    // listMessage function
    // listMessage(listMessage_payload).then(res => {
    //     console.log(res);
    // })

}

// init()

module.exports = {
    listMessage, addUser, updateToken, listAllUser, listUserFriend, loginUser, logoutUser, checkAccountExist, checkUserPidExist, checkTokenExist, inviteFriend, addMessage, setLocalTime, pk
}