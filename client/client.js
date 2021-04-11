//Initialice Enviorment Variables
require('dotenv').config();

/*IMPORTS*/
const express = require('express');
const app = express();
const getPort = require('get-port-sync');
const ip = require('ip');
const ports = {
    client: getPort()
}
//WebClient
const client = require('http').createServer(app);
const io = require("socket.io")(client);
//Server
const server = require("socket.io-client");
var count = 0;

/*--SOCKET.IO--*/
//Socket.IO Code 
io.on("connection", socket => {
    //Connect
    console.log(`Entry Connection to client, id: ${socket.id}`);
    count++;
    io.emit("usercnt",count);

    //Receive login data
    socket.on("login", data => {
        try {
            //Get user data
            const {username, password} = data;
            //Start connection with server
            const connection = server(process.env.SERVER, { reconnectionDelayMax: 10000 });
            //Try to login on server
            connection.emit('login', {
                username: username,
                password: password,
                addr: `${ip.address()}:${ports.client}`
            });
            //Get response from server
            connection.on("res", token => {
                //Return response to web UI
                socket.emit("res", token);
            });
            //Get active clients update from server
            connection.on("active", active => {
                console.log(active);
                if(active) io.emit("active", active);
            });
            //When Web client disconnects
            socket.on("disconnect", () => {
                console.log("Client Disconnected");
                count--;
                io.emit("usercnt",count);
                connection.disconnect();
            });
        } 
        //In case all gets fucked
        catch (e){ 
            console.log(e); 
            socket.emit("res",{
                code: 500,
                message: 'Something went wrong on the client'
            });
        }
    });

});



/*--WEB UI--*/

//Middleware Config && Static Resources
app.use('/static',express.static(__dirname +'/static'));

//Send View
app.get('/', (req, res) => {
    res.sendFile(__dirname+"/static/index.html");
});

/*LISTEN SERVERS*/
//Client
client.listen(ports.client, () => {
    console.log(`Listening on: ${ports.client}`);
});
//Server