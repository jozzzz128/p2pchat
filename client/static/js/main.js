
var socket = io();
const user = {
    username: 'Finn',
    password: 'Williams'
};
var flag = true;
socket.on('usercnt', msg => {
    //document.querySelector("#count").innerHTML = (msg == 1) ? 'Active users: '+msg : 'You can only have one session at the time, close other active sessions to continue...';
    if(msg != 1 && flag){
        user.username = 'Hector';
        user.password = 'Herrera';
    }
    flag = false;
});
//Receibe all response from socket

window.addEventListener('load', async () => {

    //Login button
    document.querySelector("#login").addEventListener('click', ()=>{
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
    });


});
