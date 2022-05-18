var mysql = require('mysql');
const { CLIENT_PS_MULTI_RESULTS } = require('mysql/lib/protocol/constants/client');
const chat = require('./db')

var randomstring = require("randomstring");
const { init } = require('express/lib/application');



var dbConfig = {
    host: "127.0.0.1",
    user: 'root',
    password: "",
    database: 'chatapp_v2',
}

const con = mysql.createConnection(dbConfig);

function addGroup(payload) {


    return new Promise((resolve, reject) => {

        chat.checkTokenExist(payload.token).then(user_pid => {

            let group_pid = chat.pk();

            let data = {
                group_pid: group_pid,
                group_name: payload.group_name,
                user_pid: user_pid,
                create_at: chat.setLocalTime()
            }

            let inputSql = chat.sqlFormmatSet(data);
            let sql = "INSERT INTO chat_group " + inputSql;



            con.query(sql, function (err, result) {
                if (err) reject(err)

                let data = {
                    group_pid: group_pid,
                    user_pid: user_pid
                }

                attechGroup(data).then(res => {
                    resolve(res);
                })
            })
        }).catch(err => {
            // Error : token not exist
            reject()
        });
    });

}

function attechGroup(payload) {
    return new Promise((resolve, reject) => {

        let inputSql = chat.sqlFormmatSet(payload)

        let sql = "INSERT INTO user_group " + inputSql;

        con.query(sql, function (err, result) {
            if (err) reject(err)

            resolve(true);
        })
    })
}

function userEnterGroup(payload) {


    return new Promise(async (resolve, reject) => {

        try {

            let res = await Promise.all([chat.checkTokenExist(payload.token), checkGroupExist(payload.group_pid)])
            let user_pid = res[0];
            let check = res[1];
            if (check.length > 0) {
                let data = {
                    user_pid: user_pid,
                    group_pid: payload.group_pid
                }
                resolve(await attechGroup(data))
            }
        } catch (err) {
            reject(err)
        }

    })

}

function checkGroupPermission(payload) {

    return new Promise((resolve, reject) => {
        let sql = "SELECT * FROM user_group WHERE user_pid = '" + payload.user_pid + "' AND group_pid = '" + payload.group_pid + "'";

        con.query(sql, (err, rows, fields) => {
            if (err) reject(err);
            var result = Object.values(JSON.parse(JSON.stringify(rows)));

            resolve(result);
        });
    });



}

function addGroupMessage(payload) {

    return new Promise((resolve, reject) => {
        chat.checkTokenExist(payload.token).then(async user_pid => {


            let check = await checkGroupPermission({
                user_pid: user_pid,
                group_pid: payload.group_pid
            })



            if (check.length <= 0) {
                reject()
            }
            let data = {
                group_pid: payload.group_pid,
                sender_pid: user_pid,
                content: payload.content,
                time: chat.setLocalTime()
            }

            let inputSql = chat.sqlFormmatSet(data);
            let sql = "INSERT INTO group_messages " + inputSql;

            con.query(sql, (err, result) => {
                if (err) reject(err)

                resolve(result);
            })

        }).catch(err => {
            reject(err)
        })
    })


}

function listGroupMessage(payload) {

    return new Promise((resolve, reject) => {

        chat.checkTokenExist(payload.token).then(async user_pid => {


            let data = {
                user_pid: user_pid,
                group_pid: payload.group_pid
            }


            let check = await checkGroupPermission(data);
            if (check.length <= 0)
                reject()


            let sql = "SELECT * FROM group_messages WHERE group_pid = '" + payload.group_pid + "'"

            con.query(sql, (err, rows, fields) => {
                if (err) reject(err)

                var result = Object.values(JSON.parse(JSON.stringify(rows)));
                console.log(result);
                resolve(result);

            })
        })
    })

}

function ownerGroupList(payload) {
    return new Promise((resolve, reject) => {
        chat.checkTokenExist(payload.token).then(async user_pid => {
            let sql = "SELECT * FROM user_group WHERE user_pid = '" + user_pid + "'"


            con.query(sql, (err, rows, fields) => {
                if (err) reject(err);


                var result = Object.values(JSON.parse(JSON.stringify(rows)));

                if (result.length <= 0)
                    resolve([]);

                let data = [];

                result.forEach(info => {

                    let group_pid = info.group_pid
                    let sql = "SELECT * FROM chat_group WHERE group_pid = '" + group_pid + "'"


                    con.query(sql, (err, rows, fields) => {
                        if (err) reject(err);

                        var get = Object.values(JSON.parse(JSON.stringify(rows)));
                        data.push(get[0]);

                        if (data.length == result.length) {
                            resolve(data);
                        };

                    });
                });


            });


        });
    });
};

function checkGroupExist(group_pid) {

    return new Promise((resolve, reject) => {
        let sql = "SELECT * FROM chat_group WHERE group_pid = '" + group_pid + "'"

        con.query(sql, (err, rows, fields) => {
            if (err) reject(err)

            var result = Object.values(JSON.parse(JSON.stringify(rows)));

            if (result.length <= 0) {
                reject()
            } else {
                resolve(result)
            }

        })

    })


}




module.exports = {
    addGroup, attechGroup, userEnterGroup, checkGroupPermission, addGroupMessage, listGroupMessage, ownerGroupList

}