//Open socket between WebUI && Node Client-Server
var socket = io({query:{ webclient: true }});
var body, container;

socket.on('disconnect', () => {
    console.log("Client disconnected, retry...");
});

window.addEventListener('load', () => {

    //Remove loader
    kill.removeLoader();

    //Load global selectors
    body = document.querySelector("body");
    container = document.querySelector("#container");

    //Detect when web UI is openned on other tabs
    socket.on('usercnt', msg => code.newWebClientConnection(msg));

    //Display Login && Register form
    gen.loginAndRegisterForms();

});
