//Initialice Enviorment Variables
require('dotenv').config();

const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer);
const db = require("./db/db");

io.on("connection", socket => {
    console.log(`Entry Connection to server, id: ${socket.id}`);
    try {

        //Login from socket
        socket.on('login', data => {
            const {username, password, addr} = data;
            //Try to generate token
            const token = db.loginUser({
                username: username,
                password: password,
                addr: addr,
                id: socket.id
            });
            //If log in success
            if(token){
                socket.emit("res", {
                    code: 200,
                    data: token.token
                });
                io.emit("active", token.active);
            }
            //If log in failed
            else socket.emit("res", {
                code: 500,
                message: `wrong user data or user doesn't exists`
            });
        });

        //Disconnect from server && broacast disconnection
        socket.on("disconnect", () => {
            console.log(`Disconnected from server, id: ${socket.id}`);
            io.emit("active", db.removeActiveUser(socket.id));
        });

        


    } catch (e) {
        console.log(e);
        socket.emit("res", {
            code: 500,
            message: 'something went wrong on the server'
        });
    }
});

httpServer.listen(process.env.PORT);