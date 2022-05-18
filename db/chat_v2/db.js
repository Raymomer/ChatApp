var mysql = require('mysql');
const { CLIENT_PS_MULTI_RESULTS } = require('mysql/lib/protocol/constants/client');
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
                    if (err) reject(err);
                    var result = Object.values(JSON.parse(JSON.stringify(rows)));

                    resolve(result);
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
            if (err) reject(err);

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
                if (err) reject(err);
                resolve(result);
            })
        })


    })
}


function listAllUser(payload) {
    return new Promise((resolve, reject) => {

        checkTokenExist(payload.token).then(pid => {
            console.log(pid)
            if (pid != null) {
                let sql = "SELECT pid ,name FROM user WHERE pid != '" + pid + "'";
                con.query(sql, (err, rows, fields) => {
                    var result = Object.values(JSON.parse(JSON.stringify(rows)));
                    resolve(result);
                })
            } else {
                resolve([]);
            }


        })

    })
}


function listUserFriend(payload) {
    return new Promise((resolve, reject) => {
        checkTokenExist(payload.token).then(user_pid => {
            let sql = "SELECT friend_pid FROM relateship WHERE user_pid = '" + user_pid + "'";
            con.query(sql, (err, rows, fields) => {
                if (err) reject(err);
                var userFriends = Object.values(JSON.parse(JSON.stringify(rows)));
                console.log(userFriends)
                let ans = []


                if (userFriends.length == 0) {
                    resolve(ans);
                }

                userFriends.forEach(data => {
                    sql = "SELECT pid ,name FROM user WHERE pid = '" + data.friend_pid + "'";
                    console.log(sql);
                    con.query(sql, (err, rows, fields) => {
                        if (err) reject(err);
                        var result = Object.values(JSON.parse(JSON.stringify(rows)));

                        ans.push(result[0])

                        if (userFriends.length == ans.length) {
                            console.log(ans)
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
            if (err) reject(err);
            var result = Object.values(JSON.parse(JSON.stringify(rows)));

            if (result.length > 0) {
                let token = pk()


                updateToken({
                    user_pid: result[0].pid,
                    token: token
                }).then(res => {
                    resolve(token);
                }).catch(err => {
                    reject(err);
                })




            } else {
                reject(false);

            }


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
            reject(false)
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
            if (err) reject(err);
            var result = Object.values(JSON.parse(JSON.stringify(rows)));

            if (result.length <= 0) {
                reject("Token not fonud!")
            } else {
                resolve(result[0].user_pid);
            }


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
                    if (err) reject(err);
                    resolve(result);
                });


            } else {
                reject()
            }
        })
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
                    if (err) reject(err);
                    resolve(result);
                });

            } else {
                reject("Not found user's token");
            }
        }).catch(err => {
            reject(err);
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

    console.log("SQLFORMSET")
    return "(" + Object.keys(json).join(",") + ") VALUES ('" + Object.values(json).join("','") + "') ";


}



module.exports = {
    listMessage, addUser, updateToken, listAllUser, listUserFriend, loginUser, logoutUser, checkAccountExist, checkUserPidExist, checkTokenExist, inviteFriend, addMessage, setLocalTime, pk, sqlFormmatSet
}