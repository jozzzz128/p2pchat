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

/*--SOCKET.IO--*/
//Socket.IO Code 
io.on("connection", socket => {

    //Detect if connection is from web client or another client
    code.manageConnections(io, socket);
    //Detect if user disconnects
    socket.on("disconnect", () => code.manageDisconnections(io, socket));

    //Receive login data
    socket.on("login", data => {
        try {
            //Get user data
            const {username, password} = data;
            //Start connection with server (sending login data)
            code.connectToHostServer(io, socket, {
                username: username,
                password: password,
                addr: `${ip.address()}:${ports.client}`
            });
            //When web client disconnects
            socket.on("disconnect", () => code.manageDisconnections(io, socket, connection));
        } 
        //In case all gets fucked
        catch(e){ 
            console.log(e); 
            socket.emit("res",{
                code: 500,
                message: 'Something went wrong on the client'
            });
        }
    });

});

/*Socket code*/
const code = {
    activeClientsCount: 0,
    //When a new user connects
    manageConnections: (io, socket) => {
        const {webclient} = socket.handshake.query;
        if(webclient){
            code.activeClientsCount++;
            io.emit("usercnt",code.activeClientsCount);
            console.log(`Client Connected: webclient`);
        }
        else console.log(`Client Connected: ${socket.id}`);
    },
    //When a user disconnects
    manageDisconnections: (io, socket, connection = false) => {
        const {webclient} = socket.handshake.query;
        if(webclient){
            code.activeClientsCount--;
            if(connection) connection.disconnect();
            io.emit("usercnt",code.activeClientsCount);
            console.log("Client Disconnected: webclient");
        }
        else console.log(`Client Disconnected: ${socket.id}`);
    },
    //Connection to server && functionality
    connectToHostServer: (io, socket, data) => {
        //Get user data
        const {username, password, addr} = data;
        //Start connection with server
        const connection = server(process.env.SERVER, { reconnectionDelayMax: 10000 });
        //Try to login on server
        connection.emit('login', {
            username: username,
            password: password,
            addr: addr
        });
        //Get response from server
        connection.on("res", token => {
            //Return response to web UI
            socket.emit("res", token);
        });
        //Get active clients update from server
        connection.on("active", active => {
            if(active) io.emit("active", active);
        });
    }
}


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