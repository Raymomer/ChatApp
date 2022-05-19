const express = require('express');
const path = require('path');
const http = require('http');
const port = process.env.PORT || 3000;
const socket = require('socket.io');
const { resolve } = require('path');
const chat = require(path.join(__dirname, 'db/chat_v2/db.js'))
const group = require(path.join(__dirname, 'db/chat_v2/group_db.js'))


const app = express();
const server = http.createServer(app);
const io = socket(server, { cors: { origin: '*', } });


server.listen(port, () => {
    console.log("Server listening at port %d", port);
});

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next()
})



app.post('/api/user/registr', (req, response) => {

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
        response.status(400).send({
            status: false,
            message: "Account is exist."
        });
    })

});

app.post('/api/user/login', (req, response) => {

    // console.log(req.query)
    let payload = {
        account: req.query.account,
        password: req.query.password,
    }

    chat.loginUser(payload).then(ans => {
        console.log(ans);
        if (ans != null) {
            response.send({
                status: true,
                payload: {
                    token: ans
                }
            })
        }
    }).catch(err => {
        response.status(400).send({
            status: false,
            message: "Please check your Account or password again."
        });
    })

});

app.post('/api/user/logout', (req, response) => {

    // console.log(req.query)
    let payload = {
        token: req.query.token
    }


    chat.logoutUser(payload).then(ans => {
        if (ans) {
            response.send({
                status: true,
            })
        }
    }).catch(err => {
        response.status(400).send({
            status: false,
            message: "Faile token is not exist."
        });
    })

});

app.post('/api/user/invite', (req, response) => {

    let payload = {
        token: req.query.token,
        friend_pid: req.query.friend_pid
    }


    chat.inviteFriend(payload).then(ans => {
        response.send({
            status: true,
        })
    }).catch(err => {
        response.status(400).send({
            status: false,
            message: "Faile token or friend is not exist."
        });
    })
})

app.post('/api/chat/addMessage', (req, response) => {

    let payload = {
        token: req.query.token,
        receiver_pid: req.query.receiver_pid,
        content: req.query.content
    }

    chat.addMessage(payload).then(ans => {
        response.send({
            status: true,
        })
    }).catch(err => {
        response.status(400).send({
            status: false,
            message: "Send Error."
        });
    });
});

app.post('/api/chat/listMessage', (req, response) => {


    let payload = {
        token: req.query.token,
        receiver_pid: req.query.receiver_pid,
    }


    chat.listMessage(payload).then(ans => {
        response.send(ans);
    }).catch(err => {
        response.status(400).send({
            status: false,
            message: "List Message Error."
        })
    })
})

app.post('/api/user/list', (req, response) => {


    let payload = {
        token: req.query.token
    }


    chat.listAllUser(payload).then(ans => {
        response.send(ans);
    }).catch(err => {
        response.status(400).send({
            status: false,
            message: "List All user Error."
        })
    })
})

app.post('/api/user/friend/list', (req, response) => {


    let payload = {
        token: req.query.token,
    }


    chat.listUserFriend(payload).then(ans => {
        response.send(ans);
    }).catch(err => {
        response.status(400).send({
            status: false,
            message: "List All Friend Error."
        })
    })
})


app.post('/api/user/group/register', (req, response) => {


    let payload = {
        token: req.query.token,
        group_name: req.query.group_name,
    }

    group.addGroup(payload).then(ans => {
        response.send({
            status: true
        });
    }).catch(err => {
        response.status(400).send({
            status: false,
            message: "Register group Error."
        })
    })
})

app.post('/api/user/group/enter', (req, response) => {


    let payload = {
        token: req.query.token,
        group_pid: req.query.group_pid,
    }

    group.userEnterGroup(payload).then(ans => {
        response.send({
            status: true
        });
    }).catch(err => {
        response.status(400).send({
            status: false,
            message: "Enter group Error."
        })
    })
})

app.post('/api/user/group/chat', (req, response) => {


    let payload = {
        token: req.query.token,
        group_pid: req.query.group_pid,
        content: req.query.content,
    }

    group.addGroupMessage(payload).then(ans => {
        response.send({
            status: true
        });
    }).catch(err => {
        response.status(400).send({
            status: false,
            message: "Send Message in group Error."
        })
    })
})


app.post('/api/user/group/list', (req, response) => {


    let payload = {
        token: req.query.token,
    }

    group.ownerGroupList(payload).then(ans => {
        response.send(ans);
    }).catch(err => {
        response.status(400).send({
            status: false,
            message: "Send Message in group Error."
        })
    })
})


app.post('/api/user/group/chatList', (req, response) => {


    let payload = {
        token: req.query.token,
        group_pid: req.query.group_pid,
    }

    group.listGroupMessage(payload).then(ans => {
        response.send(ans);
    }).catch(err => {
        response.status(400).send({
            status: false,
            message: "List Group Message Error."
        })
    })
})