

const code = {
    connection : socket => {
        
    },
    login: (socket, server, msg) => {
        try {
            const {username, password} = msg;

            //Send Login data to Server
            const connection = server(process.env.SERVER, {
                reconnectionDelayMax: 10000,
                query: {
                    login: {
                        username : username,
                        password: password
                    }
                }
            });

            connection.on("res", res => {
                //Return response to web UI
                socket.emit("res",{
                    code: 200,
                    message: res,
                });
            });

        } catch (e){ console.log(e); }

        //Something went wrong
        socket.emit("res",{
            code: 500,
            message: 'Something went wrong'
        });
    }
}

module.exports = code;