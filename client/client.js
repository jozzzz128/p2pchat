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
    const connection = code.connectToHostServer.connect(io, socket);
    //Detect if connection is from web client or another client
    code.manageConnections(io, socket);
    //Detect if user disconnects
    socket.on("disconnect", () => code.manageDisconnections(io, socket, connection));

    //Receive login data
    socket.on("login", data => {
        try {
            //Get user data
            const {username, password} = data;
            //Start connection with server (sending login data)
            code.connectToHostServer.action(connection, {
                route: 'login',
                username: username,
                password: password,
                addr: `${ip.address()}:${ports.client}`
            });
        } 
        //In case all gets fucked
        catch(e) { 
            console.log(e); 
            socket.emit("res",{
                code: 500,
                message: 'Something went wrong on the client'
            });
        }
    });

    //Receive login data
    socket.on("register", data => {
        try {
            //Get user data
            const {username, password} = data;
            //Start connection with server (sending login data)
            code.connectToHostServer.action(connection, {
                route: 'register',
                username: username,
                password: password,
                addr: `${ip.address()}:${ports.client}`
            });
        } 
        //In case all gets fucked
        catch(e) {
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
    connectToHostServer: {
        connect: (io, socket) => {
            //Start connection with server
            const connection = server(process.env.SERVER, { reconnectionDelayMax: 10000 });
            //Get response from server
            connection.on("res", response => {
                //Return response to web UI
                socket.emit("res", response);
            });
            //Get active clients update from server
            connection.on("active", active => {
                if(active) io.emit("active", active);
            });
            connection.on("connect_error", err => {
                socket.emit("server_connection_error", true);
            });
            connection.on('connect', () => {
                socket.emit("server_connection_error", false);
            });
            //When web client disconnects
            return connection;
        },
        action: (connection, data) => {
            //Get user data
            const {username, password, addr, route} = data;
            //Try to login on server
            connection.emit(route, {
                username: username,
                password: password,
                addr: addr
            });
        }
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
    console.log(`Listening on: ${ip.address()}:${ports.client}`);
});
//Server