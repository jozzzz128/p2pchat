//Open socket between WebUI && Node Client-Server
var socket = io({query:{ webclient: true }});
var body, container;

socket.on('disconnect', () => {
    console.log("Client disconnected, retry...");
});

window.addEventListener('load', async () => {

    //Load global selectors
    body = document.querySelector("body");
    container = document.querySelector("#container");

    //Detect when web UI is openned on other tabs
    socket.on('usercnt', msg => code.newWebClientConnection(msg));


    //Login button
    /*document.querySelector("#login").addEventListener('click', () => {
        console.log("click");
        const data = {
            username: user.username,
            password: user.password
        };
        //Send login data through socket
        socket.emit("login", data);
        //Show server response with error or token
        socket.on("res", msg => console.log(msg));
        //Update active clients data
        socket.on("active", msg => {
            console.log(user.username);
            console.log(msg.filter(active => active.username != user.username))
        });
    });*/

});
