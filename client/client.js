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
    //If connection comes from webclient
    const client = code.manageConnections(io, socket);
    if(client == "webclient"){
        const connection = code.connectToHostServer.connect(io, socket);
        //Receive login data
        socket.on("login", data => {
            try {
                //Get user data
                const {username, password} = data;
                //Establish global username
                code.gUsername = username;
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
        socket.on("reloadActive", () => {
            connection.emit("reloadActive");
        });
        //Detect if user disconnects
        socket.on("disconnect", () => code.manageDisconnections(io, socket, connection));
    }
    //If connection comes from another client
    else{
        console.log('incomming from: '+client);
        socket.on(`message_from_${client}`, data => {
            console.log(`incomming message from ${client}: ${(data.text) ? data.text : 'image'}`);
            io.emit(`message_from_${client}`, data);
        });
    }
    
});

/*Socket code*/
const code = {
    gUsername: '',
    activeHistory: [],
    activeClientsCount: 0,
    //When a new user connects
    manageConnections: (io, socket) => {
        const {webclient, username} = socket.handshake.query;
        if(webclient){
            code.activeClientsCount++;
            io.emit("usercnt",code.activeClientsCount);
            console.log(`Client Connected: webclient`);
            return "webclient";
        }
        else {
            console.log(`Client Connected: ${username}`);
            return username;
        }
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
                if(active) code.manageActiveClientRefresh(io, socket, active);
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
    },
    manageActiveClientRefresh: (io, socket, active) => {
        //If active list is different from previus active list
        if(!code.isEqual(code.activeHistory, active)){
            //Connect to new clients
            const difference = code.getActiveDifference({
                prev: code.activeHistory, 
                recent: active
            });
            code.connectToClients(socket, difference);
            //Save new active list on prev active list
            code.activeHistory = active;
            io.emit("active", code.activeHistory);
        }
    },
    getActiveDifference: config => {
        const {prev, recent} = config;
        
        //var onlyInPrev = prev.filter(comparer(recent));
        var onlyInRecent = recent.filter(comparer(prev));
        
        //return onlyInPrev.concat(onlyInB);
        return onlyInRecent;

        function comparer(otherArray){
            return function(current){
                return otherArray.filter(function(other){
                    return other.username == current.username && other.addr == current.addr
                }).length == 0;
            }
        }
    },
    connectToClients: (socket, clients) => {
        clients.forEach(client => {
            const {username, addr} = client;
            code.genClientConnection(socket, {
                username: username,
                addr: addr
            });
        });
    },
    genClientConnection: (socket, client) => {
        //Get client addr && username
        const {username, addr} = client;
        if(username != code.gUsername){
            //Start connection with user
            console.log(addr);
            const connection = server(`ws://${addr}`, { reconnectionDelayMax: 10000 , query:{ username: code.gUsername }});

            //When user disconnects or an error ocurred
            connection.on("connect_error", err => {
                console.log(`lost connection with ${username}`);
                console.log(err);
                socket.emit(`${username}_connection_error`, true);
            });
            //When connection with user is restored successfully
            connection.on('connect', () => {
                console.log(`Established connection with ${username}`);
                socket.emit(`${username}_connection_error`, false);
            });
            //When message is sent to username
            socket.on(`message_to_${username}`, data => {
                console.log(`sent message to ${username}: ${data.text}`);
                connection.emit(`message_from_${code.gUsername}`, data);
            });
            return connection;
        }
    },
    //Compare arrays, object arrays && objects
    isEqual: (value, other) => {

        // Get the value type
        var type = Object.prototype.toString.call(value);
    
        // If the two objects are not the same type, return false
        if (type !== Object.prototype.toString.call(other)) return false;
    
        // If items are not an object or array, return false
        if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;
    
        // Compare the length of the length of the two items
        var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
        var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
        if (valueLen !== otherLen) return false;
    
        // Compare two items
        var compare = function (item1, item2) {
    
            // Get the object type
            var itemType = Object.prototype.toString.call(item1);
    
            // If an object or array, compare recursively
            if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
                if (!code.isEqual(item1, item2)) return false;
            }
    
            // Otherwise, do a simple comparison
            else {
    
                // If the two items are not the same type, return false
                if (itemType !== Object.prototype.toString.call(item2)) return false;
    
                // Else if it's a function, convert to a string and compare
                // Otherwise, just compare
                if (itemType === '[object Function]') {
                    if (item1.toString() !== item2.toString()) return false;
                } else {
                    if (item1 !== item2) return false;
                }
    
            }
        };
    
        // Compare properties
        if (type === '[object Array]') {
            for (var i = 0; i < valueLen; i++) {
                if (compare(value[i], other[i]) === false) return false;
            }
        } else {
            for (var key in value) {
                if (value.hasOwnProperty(key)) {
                    if (compare(value[key], other[key]) === false) return false;
                }
            }
        }
    
        // If nothing failed, return true
        return true;
    
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