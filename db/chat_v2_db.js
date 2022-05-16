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





function listMessage() { };
function addMessage(payload) {

};

function addGroup() { };

function addMember(payload) {

    return new Promise((resolve, reject) => {
        var currentTime = setLocalTime();
        var pid = pk();

        payload["pid"] = pid;
        payload["create_at"] = currentTime;
        payload["update_at"] = currentTime;
        payload["status"] = 0;

        let inputSql = sqlFormmatSet(payload);

        var sql = "INSERT INTO user " + inputSql;

        con.query(sql, function (err, result) {
            if (err) throw reject(err);
            resolve(result)
        })
    })
};

function inviteFriend(payload) {

    return new Promise((resolve, reject) => {
        let inputSql = sqlFormmatSet(payload);
        var sql = "INSERT INTO user_friend " + inputSql;

        con.query(sql, function (err, result) {
            if (err) throw reject(err);
            resolve(result);
        });

    });
}

function addMessage(payload) {


    return new Promise((resolve, reject) => {

        var currentTime = setLocalTime();

        payload['create_at'] = currentTime;

        let inputSql = sqlFormmatSet(payload);
        var sql = "INSERT INTO messages " + inputSql;

        console.log(sql)

        con.query(sql, function (err, result) {
            if (err) throw reject(err);
            resolve(result);
        });

    });
}


function removeFriend() {

}


function checkMenber() { };

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


let addMember_payload =
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
            name: "",
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

let invite_payload = {
    user_pid: "SmmDzxMwNDvdNSG",
    friend_pid: "m5ogDMQaEVjades"
}

let message_payload = {
    user_pid: "SmmDzxMwNDvdNSG",
    friend_pid: "m5ogDMQaEVjades",
    content: "今天又想來點特別的 !",
}


function init() {

    // addMember function 

    // addMember_payload.forEach(profile => {
    //     addMember(profile).then(res => {
    //         console.log(res)
    //     }).catch(err => {
    //         console.log("err => ", err)
    //     })
    // })



    // inviteFriend function 
    // inviteFriend(invite_payload).then(res => {
    //     console.log(res)
    // }).catch(err => {
    //     console.log("err => ", err)
    // })



    // addMessage function
    addMessage(message_payload).then(res => {
        console.log(res)
    }).catch(err => {
        console.log(err)
    })


}

init()