//Open socket between WebUI && Node Client-Server
var socket = io({query:{ webclient: true }});
var body, container;
var serverConnectionError = true;

window.addEventListener('load', async () => {

    //Socket event load
    code.socketEventLoad();

    //Remove loader
    kill.removeLoader();

    //Load global selectors
    body = document.querySelector("body");
    container = document.querySelector("#container");

    //Detect when web UI is openned on other tabs
    socket.on('usercnt', msg => code.newWebClientConnection(msg));

    //Verify if theres a session token && is valid
    const username = await code.detectActiveSession(socket);

    /*//If theres a token && is valid
    if(username) {
        console.log(username);
        //gen.messageAndChat(username); 
    }

    //Display Login && Register form
    else gen.loginAndRegisterForms();*/
    gen.userChat.init();

});
