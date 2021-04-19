const code = {
    activeList: [],
    socketEventLoad: (socket) => {
        //When client cannot connect to server
        socket.on('server_connection_error', flag => {
            if(serverConnectionError && flag){
                gen.loadBlockPop({
                    title: 'Se ha perdido la conexión con el servidor',
                    text: [
                        'Intentando reconectar con el servidor...',
                        'Verifica tu conexión a internet.'
                    ]
                });
                serverConnectionError = false;
            }
            else if(!flag){
                kill.popWindow();
                serverConnectionError = true;
            }
        });
        //When connection to client is lost
        socket.on('disconnect', () => {
            gen.loadBlockPop({
                title: 'Se ha perdido la conexión con el cliente',
                text: [
                    'Intentando reconectar con el cliente...',
                    'Verifica tu conexión a internet.'
                ]
            });
        });
        //When active clients array updates
        socket.on("active", activeUsers => {
            //If chat is open && working
            const chat = container.querySelector("#forms.message-view");
            if(chat){
                console.log("refrescando chat");
                const difference = code.getActiveDifference({
                    prev: code.activeList,
                    recent: activeUsers
                });
                animations.animateChat(chat, difference.map(user => user.username));
            }
            code.activeList = activeUsers;
            
        });
    },
    newWebClientConnection: usercount => {
        if(usercount != 1){
            const prevMessage = document.querySelector(".prompt-background");
            if(prevMessage) prevMessage.remove();
            gen.loadBlockPop({
                title: 'Se ha detectado otra sesión abierta',
                text: [
                    'Unicamente se puede tener una sesión abierta por usuario.',
                    'Manten una sola sesión abierta para continuar...'
                ]
            });
        }
        else kill.popWindow();
    },
    detectActiveSession: async socket => {
        const token = sessionStorage.token;
        const flags = {
            loop: true,
            answer: false
        };

        //Send login token through socket
        if(token){
            socket.emit("login", token);
            socket.on("res", data => {              
                if(data.code == 200) flags.answer = data.username;
                flags.loop = false;
            });
        }
        else flags.loop = false;
        
        //Wait for response
        await awaitResponse();
        async function awaitResponse(){
            await util.asyncSetTimeOut(()=>{
                if(flags.loop) awaitResponse();
                return flags.answer;
            },300);
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
    contactListSocket: userList => {
        userList.forEach(username => {

            //When message is received from user
            socket.on(`message_from_${username}`, data => {
                const {date, text, image} = data;
                const append = document.querySelector(`#chat-${username} .message-container`);
                if(image){
                    append.append(gen.userChat.message({
                        date: date,
                        image: image,
                        remitent: true
                    }));
                }
                else{
                    append.append(gen.userChat.message({
                        date: date,
                        text: text,
                        remitent: true
                    }));
                }
                //Scroll chat to bottom
                util.scrollToBottom(append);
            });
            //When error is receibed from user
            socket.on(`${username}_connection_error`, flag => {
                if(flag){ 
                    console.log(`user ${username} disconnected`); 
                }
                else console.log(`user ${username} connected`); 
            });

        });
    }
};

const gen = {
    loadBlockPop: async config => {
        const {title, text} = config;
        var lines = ''; text.forEach(line => { lines += `<p>${line}</p>`; });
        //Blur page content
        if(!container.classList.contains("blur")) container.classList.add("blur");
        const exceeded = document.createElement("div");
        exceeded.classList.add("prompt-background");
        exceeded.classList.add("flex-centered");
        exceeded.id = "exceeded-connections";
        exceeded.innerHTML = `
            <div class="prompt-window flex-centered">
                <div class="content flex-centered">
                    ${gen.loadingAnimation()}
                    <div class="info">
                        <h2>${title}</h2>
                        ${lines}
                    </div>
                </div>
            </div>
        `;
        if(body.querySelector(".prompt-background")) await kill.popWindow(false);
        setTimeout(() => {
            exceeded.classList.add("open");
        },300);
        body.append(exceeded);
    },
    loadingAnimation: () => {
        return `
            <div class="loader lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        `;
    },
    loginAndRegisterForms: () => {
        const forms = document.createElement("div");
        forms.id = "forms";
        forms.innerHTML = `
            <aside class="flex-centered left">
                <div class="background"></div>
                <div class="content">
                    <div class="login info left on">
                        <h2>Hola, amig@!</h2>
                        <p>Si aún no envias mensajes con nosotros, puedes crearte una cuenta en el botón a continuación!</p>
                    </div>
                    <div class="register info right">
                        <h2>Bienvenid@!</h2>
                        <p>Te estabamos esperando!, aún te quedan muchos mensajes por enviar a tus contactos.</p>
                    </div>
                    <button>
                        <span class="sign-b right on">Registrarse</span>
                        <span class="log-b left">Inicia Sesión</span>
                    </button>
                </div>
            </aside>
            <div class="form-content flex-centered">
                <div id="login-f" class="form left on">
                    <h2>Inicia Sesión en Ark</h2>
                    <ul class="buttons">
                        <a href="https://github.com/jozzzz128/p2pchat" target="_blank" class="icon-github"></a>
                    </ul>
                    <p class="advice">o visita el repositorio de este proyecto</p>
                    <div class="camp-container">
                        <div class="notifications"></div>
                        <div class="camps">
                            <div class="camp username">
                                <input type="text" id="username-l" required>
                                <label for="username-l">
                                    <span class="icon-user"></span>
                                    <span class="text">Nombre de Usuario</span>
                                </label>
                            </div>
                            <div class="camp password last">
                                <input type="password" id="password-l" required>
                                <label for="password-l">
                                    <span class="icon-lock"></span>
                                    <span class="text">Contraseña</span>
                                </label>
                            </div>
                            <a class="forgot-password">¿Olvidaste tu contraseña?</a>
                            <button class="disabled">
                                <span class="on">iniciar sesión</span>
                                <span class="icon-spinner8"></span>
                            </button>
                        </div>
                    </div>
                </div>
                <div id="register-f" class="form right">
                    <h2>Registrate en Ark!</h2>
                    <ul class="buttons">
                        <a href="https://github.com/jozzzz128/p2pchat" target="_blank" class="icon-github"></a>
                    </ul>
                    <p class="advice">o visita el repositorio de este proyecto</p>
                    <div class="camp-container">
                        <div class="notifications"></div>
                        <div class="camps">
                            <div class="camp username">
                                <input type="text" id="username-r" required>
                                <label for="username-r">
                                    <span class="icon-user"></span>
                                    <span class="text">Nombre de Usuario</span>
                                </label>
                            </div>
                            <div class="camp password">
                                <input type="password" id="password-r" required>
                                <label for="password-r">
                                    <span class="icon-lock"></span>
                                    <span class="text">Contraseña</span>
                                </label>
                            </div>
                            <div class="camp passwordConfirmation last">
                                <input type="password" id="password-confirm-r" required>
                                <label for="password-confirm-r">
                                    <span class="icon-lock"></span>
                                    <span class="text">Confirmar Contraseña</span>
                                </label>
                            </div>
                            <button class="disabled">
                                <span class="on">registrame</span>
                                <span class="icon-spinner8"></span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        //Load functionality form animations
        animations.animateForm(forms);
        container.append(forms);
    },
    userChat: {
        init: config => {
            const {username, activeClients} = config;
            const forms = document.createElement("div");
            forms.id = "forms";
            forms.classList.add("message-view");
            forms.innerHTML = `
            <aside class="flex-centered left">
                <div class="background"></div>
                <div class="content">
                    <div class="profile on">
                        <div class="top">
                            <div class="thumb"></div>
                            <p>@${username}</p>
                        </div>
                        <div class="bottom">
                            <button>
                                <span class="on">Cerrar Sesión</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
            <div class="chat flex-centered">
                <div class="active-users">
                    <!--<div class="search">
                        <label for="search-bar" class="icon-search"></label>
                        <input id="search-bar" type="text" placeholder="Buscar usuarios...">
                    </div>-->
                    <ul></ul>
                </div>
                <div class="conversation">
                    <div class="background"></div>
                </div>
            </div>
            `;
            //Load functionality form animations (needs a userList)
            animations.animateChat(forms, activeClients.map(item => item.username).filter(user => user != username));
            container.append(forms);
        },
        contactAnimation: usernames => {
            const prev = document.querySelector("#contact-animation");
            const style = document.createElement("style");
            style.id = "contact-animation";
            var content = ``;
            usernames.forEach(username => {
                const selector = `#forms.message-view .chat.on-${username}`;
                const contact = `${selector} .active-users ul li.contact-${username}`;
                content += `
                    /*--Contact-@${username}--*/
                    ${contact}{
                        background: var(--aside-message-thumb-color);
                        cursor: default;
                    }
                    
                    ${contact} .info{
                        color: #fff;
                    }
                    
                    ${contact} .info .last-message{
                        color: #f2f2f2;
                    }
                    
                    ${contact} .time{
                        color: #f2f2f2;
                    }
                    /*--Chat-@${username}--*/
                    ${selector} .conversation #chat-${username}{
                        display:block;
                    }
                `;
            });
            style.innerHTML += content;
            if(prev) prev.remove();
            document.querySelector("head").append(style);
        },
        conversationList: config => {
            const {userList, append} = config;
            userList.forEach(username => {
                append.append(gen.userChat.conversation({
                    username: username
                    /*messageList: [
                        {
                            date: '10:34pm',
                            remitent: true,
                            text: 'This is the message text'    
                        }
                    ]*/
                }));
            });
        },
        conversation: config => {
            const {username, messageList} = config;
            const conversation = document.createElement("div");
            conversation.classList.add("chat-content");
            conversation.id = `chat-${username}`;
            conversation.innerHTML = `
                <h2 class="title">
                    @${username}
                </h2>
                <div class="message-container"></div>
                <div class="controls flex-centered">
                    <input type="text" placeholder="Escribe un mensaje (o limpia el chat presionando: ctrl + shift + l)...">
                    <div class="attach">
                        <label class="icon-paperclip" for="attach-${username}"></label>
                        <input type="file" id="attach-${username}" accept="image/x-png,image/gif,image/jpeg" />
                    </div>
                </div>
            `;
            //Add functionality to chat input
            const input = conversation.querySelector('.controls input[type="text"]');
            const append = conversation.querySelector(".message-container");
            const file = conversation.querySelector('.controls .attach input[type="file"]');
            //Send message functionality
            util.enterPressed(input, () => {
                const value = input.value.trim();
                //If value is not empty
                if(!util.validate.empty(value)){
                    const messageContent = {
                        date: moment().format('LT'),
                        text: value
                    };
                    //Send message to username
                    socket.emit(`message_to_${username}`, messageContent);
                    //Display message on chat
                    append.append(gen.userChat.message(messageContent));
                    //Clear input
                    input.value = '';
                    //Scroll chat to bottom
                    util.scrollToBottom(append);
                }
            });
            //Clear console functionality
            util.multipleKeysPressed({
                selector: input,
                keys: ['control','shift','l'],
                callback: () => {
                    append.innerHTML = '';
                }
            });

            //Add functionality to input file
            file.addEventListener("change", () => {
                const image = file.files[0];
                const reader = new FileReader();

                reader.addEventListener("load", function () {
                    file.value = '';
                    const messageContent = {
                        date: moment().format('LT'),
                        image: reader.result
                    };
                    //Send message to username
                    socket.emit(`message_to_${username}`, messageContent);
                    //Display message on chat
                    append.append(gen.userChat.message(messageContent));
                    //Scroll chat to bottom
                    util.scrollToBottom(append);

                }, false);

                if(image) reader.readAsDataURL(image);
            });

            if(messageList){
                messageList.forEach(message => {
                    const {date, text, remitent} = message;
                    append.append(gen.userChat.message({
                        date: date,
                        text: text,
                        remitent: remitent
                    }));
                });
            }
            return conversation;
        },
        contactList: config => {
            const {append, userList, chat} = config;
            userList.forEach(username => {
                append.append(gen.userChat.contact({
                    username: username,
                    chat: chat
                }));
            });
        },
        contact: config => {
            const {username, chat} = config;
            const contact = document.createElement("li");
            contact.className = `flex-centered contact-${username}`;
            contact.innerHTML = `
                <div class="thumb">
                    <span class="messages flex-centered">
                        3
                    </span>
                </div>
                <p class="info">
                    @${username}
                    <span class="last-message">Help me open the door.</span>
                </p>
                <span class="time">3h</span>
            `;
            util.toggleClick(contact, () => {
                if(!chat.classList.contains(`on-${username}`)) chat.className = `chat flex-centered on-${username}`;
            });
            return contact;
        },
        message: config => {
            const {date, text, image, remitent} = config;
            const message = document.createElement("div");
            message.className = remitent ? 'message left flex-centered' : 'message right flex-centered';
            //If message is an base64 image
            if(image){
                message.innerHTML = remitent ? `
                <div class="thumb flex-centered">
                    <span class="date">${date}</span>
                </div>
                <div class="message-content image">
                    <span class="triangle"></span>
                    <img src="${image}">
                </div>
            ` : `
                <div class="message-content image">
                    <span class="triangle"></span>
                    <img src="${image}">
                </div>
                <div class="thumb flex-centered">
                    <span class="date">${date}</span>
                </div>
            `;
            }
            else{
                message.innerHTML = remitent ? `
                <div class="thumb flex-centered">
                    <span class="date">${date}</span>
                </div>
                <div class="message-content">
                    <span class="triangle"></span>
                    <p>${text}</p>
                </div>
            ` : `
                <div class="message-content">
                    <span class="triangle"></span>
                    <p>${text}</p>
                </div>
                <div class="thumb flex-centered">
                    <span class="date">${date}</span>
                </div>
            `;
            }
            return message;
        }
    },
    formNotification: (config = {type : "", text : ""}) => {
        const {type, text, append} = config;
        const notification = document.createElement("div");
        notification.className = `notification flex-centered ${type}`;
        notification.innerHTML = `
            <p>
                <span>${type}</span>
                ${text}
            </p>
        `;
        kill.formNotification(append);
        append.append(notification);
    }
};

const kill = {
    popWindow: async (focus = true) => {
        const pop = body.querySelector(".prompt-background");
        if(pop){
            pop.classList.add("close");
            await util.asyncSetTimeOut(() => {
                if(focus) container.classList.remove("blur");
                pop.remove();
            },300);
            return true;
        }
        return false;
    },
    removeLoader: () => {
        const loader = document.querySelector("#loader");
        setTimeout(()=> {
            loader.classList.add("bannish");
            setTimeout(()=> {
                loader.remove();
            },600);
        },1000);
    },
    loginAndRegisterForms: () => {
        const forms = container.querySelector("#forms");
        forms.remove();
    },
    formNotification: append => {
        const prev = append.querySelector(".camp-container .notifications .notification");
        if(prev) prev.remove();
    }
}; 
