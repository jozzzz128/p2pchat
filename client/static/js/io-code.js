const code = {
    socketEventLoad: () => {
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
            //console.log(activeUsers.filter(active => active.username != data.username));
            console.log(activeUsers);
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
            <aside class="flex-centered">
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
                        <a href="#" target="_blank" class="icon-github"></a>
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
                        <a href="#" target="_blank" class="icon-github"></a>
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
        init: () => {
            const forms = document.createElement("div");
            forms.id = "forms";
            forms.classList.add("message-view");
            forms.innerHTML = `
            <aside class="flex-centered">
                <div class="background"></div>
                <div class="content">
                    <div class="profile left on">
                        <div class="top">
                            <div class="thumb"></div>
                            <p>@elcarlosballarta</p>
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
                    <ul>
                    ${gen.userChat.contact({
                        username: 'elwikilixfounder'
                    })}
                    </ul>
                </div>
                <div class="conversation">
                    <div class="background"></div>
                    ${gen.userChat.conversation({
                        username: 'elwikilixfounder',
                        messageList: [
                            {
                                date: '10:34pm',
                                remitent: true,
                                text: 'This is the message text'    
                            },
                            {
                                date: '10:34pm',
                                text: 'This is the message text of me'    
                            },
                            {
                                date: '10:34pm',
                                remitent: true,
                                text: 'This is the message text'    
                            },
                            {
                                date: '10:34pm',
                                text: 'This is the message text of me'    
                            },
                            {
                                date: '10:34pm',
                                remitent: true,
                                text: 'This is the message text'    
                            },
                            {
                                date: '10:34pm',
                                text: 'This is the message text of me'    
                            },
                            {
                                date: '10:34pm',
                                remitent: true,
                                text: 'This is the message text'    
                            },
                            {
                                date: '10:34pm',
                                text: 'This is the message text of me'    
                            },
                            {
                                date: '10:34pm',
                                text: 'This is the message text'    
                            },
                            {
                                date: '10:34pm',
                                text: 'This is the message text of me'    
                            },
                            {
                                date: '10:34pm',
                                text: 'This is the message text'    
                            },
                            {
                                date: '10:34pm',
                                text: 'This is the message text of me'    
                            },
                            {
                                date: '10:34pm',
                                remitent: true,
                                text: 'This is the message text'    
                            },
                            {
                                date: '10:34pm',
                                text: 'This is the message text of me'    
                            }
                        ]
                    })}
                </div>
            </div>
            `;
            //Load functionality form animations
            animations.animateChat(forms);
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
        conversation: config => {
            const {username, messageList} = config;
            var messages = '';
            messageList.forEach(message => {
                const {date, text, remitent} = message;
                messages += gen.userChat.message({
                    date: date,
                    text: text,
                    remitent: remitent
                });
            });
            var content = `
            <div class="chat-content" id="chat-${username}">
                <h2 class="title">
                    @${username}
                </h2>
                <div class="message-container">${messages}</div>
                <div class="controls flex-centered">
                    <input type="text" placeholder="Escribe un mensaje...">
                    <span class="icon-paperclip"></span>
                </div>
            </div>
            `;
            return content;
        },
        contact: config => {
            const {username} = config;
            const content = `
            <li class="flex-centered contact-${username}">
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
            </li>
            `;
            return content;
        },
        message: config => {
            const {date, text, remitent} = config;
            let message = ``;
            if(remitent) {
                message += `
                <div class="message left flex-centered">
                    <div class="thumb flex-centered">
                        <span class="date">${date}</span>
                    </div>
                    <div class="message-content">
                        <span class="triangle"></span>
                        <p>${text}</p>
                    </div>
                </div>
                `;
            }
            else {
                message += `
                <div class="message right flex-centered">
                    <div class="message-content">
                        <span class="triangle"></span>
                        <p>${text}</p>
                    </div>
                    <div class="thumb flex-centered">
                        <span class="date">${date}</span>
                    </div>
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
    formNotification: append => {
        const prev = append.querySelector(".camp-container .notifications .notification");
        if(prev) prev.remove();
    }
}; 
