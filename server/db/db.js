const fs = require('fs');
const jwt = require("jsonwebtoken");
const fileName = "./db/file.json";

var activeUsers = [];

const consults = {
    registerUser: data => {
        const {username, password, addr, id} = data;
        //Verify if user already exists
        if(consults.userExists({username: username, password: password})) return false;
        //Register user
        consults.methods.overwriteJSON({username: username, password: password});
        //Generate token
        const token = jwt.sign({ username: username }, process.env.TOKEN_KEY);
        //Return Token && Active user list
        return {
            token: token,
            active: consults.getActiveUsers(username, addr, id)
        };
    },
    loginUser: data => {
        const {username, password, addr, id} = data;
        //If user doesn't exists
        if(!consults.userExists({username: username, password: password}) || !consults.getActiveUsers(username)){
            console.log(activeUsers);
            console.log(`user '${username}' doesnt exists or is already active`);
            return false;
        }
        //Generate token
        const token = jwt.sign({ username: username }, process.env.TOKEN_KEY);
        //Return Token && Active user list
        return {
            token: token,
            active: consults.getActiveUsers(username, addr, id)
        };
    },
    userExists: data => {
        //If data is a token
        if(typeof(data) == "string") {
            try {
                const decoded = jwt.verify(data, process.env.TOKEN_KEY);
                const db = consults.methods.getJSON().some(user => user.username == decoded.username);
                if(db) return true;
            } catch(e) { console.log(e); }
            return false;
        }
        //Else data is a JSON with user && password
        else {
            const db = consults.methods.getJSON().some(user => user.username == data.username);
            if(db) return true;
            return false;
        }
    },
    getActiveUsers: (username, addr, id) => {
        //Check if user already active
        const alreadyActive = activeUsers.some(user => user.username == username);
        if(alreadyActive) return false;
        else if(username && addr && id){
            activeUsers.push({
                username: username,
                addr: addr,
                id: id
            });
            console.log(activeUsers);
            //Pop users id
            return activeUsers.map(user => {
                return {
                    username: user.username,
                    addr: user.addr
                }
            });
        }
        else if(username) return true;
    },
    reloadActiveUsers: () => {
        return activeUsers.map(user => {
            return {
                username: user.username,
                addr: user.addr
            }
        });
    },
    removeActiveUser: id => {
        //Remove user from active users
        activeUsers = activeUsers.filter(user => user.id != id);
        console.log(activeUsers);
        return activeUsers;
    },
    methods:{
        getJSON: () => {
            return JSON.parse(fs.readFileSync(fileName));
        },
        overwriteJSON: data => {
            const rawfile = fs.readFileSync(fileName);
            const file = JSON.parse(rawfile);
            file.push(data);
                
            fs.writeFile(fileName, JSON.stringify(file, null, 2), err => {
                if (err) { console.log(err); return false; }
                return true;
            });
        }
    }
};

module.exports = consults;