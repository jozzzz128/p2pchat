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
            console.log(`username: ${username}`);
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
                    token: token.token,
                    message: `Inicio de sesión exitoso!!, Bienvenid@ ${username}.`
                });
                io.emit("active", token.active);
            }
            //If log in failed
            else {
                socket.emit("res", {
                    code: 500,
                    message: `El usuario no existe, las credenciales de acceso son incorrectas, o este usuario ya se encuentra activo.`
                });
                socket.disconnect();
            }
        });

        //Register from socket
        socket.on('register', data => {
            const {username, password, addr} = data;
            //Try to generate token
            const token = db.registerUser({
                username: username,
                password: password,
                addr: addr,
                id: socket.id
            });
            //If log in success
            if(token){
                socket.emit("res", {
                    code: 200,
                    token: token.token,
                    message: `Registro exitoso!!, Bienvenid@ ${username}.`
                });
                io.emit("active", token.active);
            }
            //If log in failed
            else{
                socket.emit("res", {
                    code: 500,
                    message: `El usuario ya se encuentra registrado`
                });
                socket.disconnect();
            }
        });

        //Disconnect from server && broacast disconnection
        socket.on("disconnect", () => {
            console.log(`Disconnected from server, id: ${socket.id}`);
            io.emit("active", db.removeActiveUser(socket.id));
        });

        //Reload Active
        socket.on("reloadActive", () => {
            io.emit("active", db.reloadActiveUsers());
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