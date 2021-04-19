const flags = {
    loginButtonEnabled: false,
    registerButtonEnabled: false,
    permanentDisableFormButton: false,
};

const animations = {
    animateForm: forms => {
        //Selectors
        const aside = forms.querySelector("aside");
        const buttons = aside.querySelectorAll("button span");
        const infos = aside.querySelectorAll(".content .info");
        const myForms = forms.querySelectorAll(".form-content .form");
        const forgot = myForms[0].querySelector(".forgot-password");
        const loginForm = forms.querySelector("#login-f");
        const registerForm = forms.querySelector("#register-f");

        /*--On click sidebar button--*/
        util.toggleClick(buttons[0].parentElement, () => {
            //Aside Movement
            if(aside.classList.contains("right")){
                aside.classList.remove("right");
                aside.classList.add("left");
            }
            else{
                aside.classList.add("right");
                aside.classList.remove("left");
            }
            //Display text
            animateElement(infos);
            //Display button
            animateElement(buttons);
            //Forms
            animateElement(myForms);

            function animateElement(elements){
                elements.forEach(element => {
                    //element show 
                    if(element.classList.contains("on")){
                        const movement = element.classList.contains('left') ? 'hide-left' : 'hide-right';
                        //element display
                        element.classList.remove("on");
                        element.classList.add(movement);
                        setTimeout(()=>{ element.classList.remove(movement); },600);
                    }
                    //Display hidden element
                    else setTimeout(() => element.classList.add("on"),600);
                });
            }
        });

        /*--On click forgot password button --*/
        util.toggleClick(forgot, () => {
            gen.formNotification({
                append: container.querySelector("#login-f .camp-container .notifications"),
                type: "response",
                text: "Ni modo te chingaste jsjsjs"
            });
        });

        /*--Validate forms--*/
        //Login form
        util.validate.form(loginForm, {
            flag: flags.loginButtonEnabled,
            buttonCallback: async (data) => {
                var finish = true;
                var disableButton = false;
                //Send login data through socket
                socket.emit("login", data);
                //Show server response with error or token
                socket.on("res", config => {
                    const {code, token, message} = config;
                    //If everything is ok
                    if(code == 200){
                        //Disable button
                        disableButton = true;
                        //Save session token
                        sessionStorage.token = token;
                        //Display Notification to user
                        gen.formNotification({
                            append: container.querySelector("#login-f .camp-container .notifications"),
                            type: "ok",
                            text: message
                        });
                    }
                    else if(code == 500) gen.formNotification({
                        append: container.querySelector("#login-f .camp-container .notifications"),
                        type: "error",
                        text: message
                    });

                    finish = false;
                });
                
                await awaitResponse();
                async function awaitResponse(){
                    await util.asyncSetTimeOut(()=>{
                        if(finish) awaitResponse();
                    },500);
                }

                //If response was correct return info for generating chat
                if(disableButton) return {
                    username: data.username,
                    activeClients: code.activeList
                };
            }
        });
        //Register form
        util.validate.form(registerForm, {
            flag: flags.registerButtonEnabled,
            buttonCallback: async data => {
                var finish = true;
                var disableButton = false;
                //Send login data through socket
                socket.emit("register", data);
                //Show server response with error or token
                socket.on("res", config => {
                    const {code, token, message} = config;
                    //If everything is ok
                    if(code == 200){
                        //Disable button
                        disableButton = true;
                        //Save token
                        sessionStorage.token = token;
                        //Show notification
                        gen.formNotification({
                            append: container.querySelector("#register-f .camp-container .notifications"),
                            type: "ok",
                            text: message
                        });
                    }
                    else if(code == 500) gen.formNotification({
                        append: container.querySelector("#register-f .camp-container .notifications"),
                        type: "error",
                        text: message
                    });

                    finish = false;
                });
                
                await awaitResponse();
                async function awaitResponse(){
                    await util.asyncSetTimeOut(()=>{
                        if(finish) awaitResponse();
                    },500);
                }

                //If response was correct return info for generating chat
                if(disableButton) return {
                    username: data.username,
                    activeClients: code.activeList
                };
            }
        });
    },
    animateChat: (forms, userList) => {
        //Selectors
        //const aside = forms.querySelector("aside");
        const chat = forms.querySelector(".chat");
        const activeUsers = chat.querySelector(".active-users ul");
        const conversation = chat.querySelector(".conversation");

        //Add CSS to head to control chat display => .chat .on-username
        gen.userChat.contactAnimation(userList);
        //Add contacts to contact list
        gen.userChat.contactList({
            append: activeUsers,
            chat: chat,
            userList: userList
        });
        //Add message chat to all contacts on contact list
        gen.userChat.conversationList({
            append: conversation,
            userList: userList
        });
        //Add socket functionality to all contacts on contact list
        code.contactListSocket(userList);
    }
};

const util = {
    toggleClick: (selector, callback, config = { time: 1000 }) => {
        selector.addEventListener("click", toggle);
        function toggle(){
            selector.removeEventListener("click", toggle);
            callback();
            setTimeout(()=>{ selector.addEventListener("click", toggle); },config.time);
        }
    },
    enterPressed: (selector, callback) => {
        selector.addEventListener("keyup", e => {
            // Number 13 is the "Enter" key on the keyboard
            if (e.keyCode === 13) {
                // Cancel the default action, if needed
                e.preventDefault();
                // Trigger the button element with a click
                callback();
            }
        });
    },
    multipleKeysPressed: config => {
        const {selector, keys, callback} = config;
        const capKeys = keys.map(key => util.capitalice(key));
        let keysPressed = {};

        selector.addEventListener('keydown', (event) => {
            keysPressed[event.key] = true;
            if(allPressed() && event.key == capKeys[capKeys.length-1]) callback();
        });
            
        selector.addEventListener('keyup', (event) => {
            delete keysPressed[event.key];
        });

        function allPressed(){
            let flag = true;
            for (let i = 0; i < capKeys.length-1; i++) {
                const key = capKeys[i];
                if(!keysPressed[key]){
                    flag = false;
                    break;
                }
            }
            return flag;
        }
    },
    capitalice: text => {
        return text.replace(/^\w/, (c) => c.toUpperCase()); 
    },
    scrollToBottom: elem => {
        elem.scrollTop = elem.scrollHeight;
    },
    extractInputValue: element => {
        if(typeof(element) == "string") return element;
        return element.value;
    },
    asyncSetTimeOut: async (callback = ()=>{}, time = 0) => {
        await new Promise((resolve)=>setTimeout(() => {
            callback();
            resolve();
        }, time)); 
    },
    imageToBase64: (url, callback) => {
            var xhr = new XMLHttpRequest();
            xhr.onload = function() {
              var reader = new FileReader();
              reader.onloadend = function() {
                callback(reader.result);
              }
              reader.readAsDataURL(xhr.response);
            };
            xhr.open('GET', url);
            xhr.responseType = 'blob';
            xhr.send();
    },
    delay: async time => {
        await util.asyncSetTimeOut(() => {}, time);
    },
    validate: {
        username: username => {
            const value = util.extractInputValue(username);
            /*
                - Only contains alphanumeric characters, underscore and dot.
                - Underscore and dot can't be at the end or start of a username (e.g _username / username_ / .username / username.).
                - Underscore and dot can't be next to each other (e.g user_.name).
                - Underscore or dot can't be used multiple times in a row (e.g user__name / user..name).
                - Number of characters must be between 8 to 20.
            */
            if(/^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/.test(value)) return true;
            return false;
        },
        password: password => {
            const value = util.extractInputValue(password);
            /*
                Minimum eight characters, at least one letter and one number:
            */
           if(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value)) return true;
           return false;
        },
        passwordConfirmation: input => {
           const passwordInput = util.extractInputValue(input.parentElement.parentElement.querySelector('.camp.password input[type="password"]'));
           const passwordConfirmationInput = util.extractInputValue(input);
           if(passwordInput == passwordConfirmationInput) return true;
           return false;
        },
        empty: text => {
            if(text.length == 0) return true;
            return false;
        },
        multiple: camps => {
            var flag = true;
            let data = {};
            for (let i = 0; i < camps.length; i++) {
                const camp = camps[i];
                const validationType = camp.className.split(' ')[1];
                const input = camp.querySelector("input");
                //If input content is invalid
                if(!util.validate[validationType](input)){
                    flag = false;
                    if(camp.classList.contains("correct")) camp.classList.remove("correct");
                    break;
                }
                else {
                    camp.classList.add("correct");
                    data[validationType] = input.value;
                }
            }
            return (flag ? data : false) ;
        },
        form: (form, config) => {
            let {buttonCallback, flag} = config;
            const camps = form.querySelectorAll(".camp-container .camps .camp");
            const formButton = form.querySelector("button");
            var validCamps;

            //Add change event to all camps
            camps.forEach(camp => {
                const input = camp.querySelector("input");
                input.addEventListener("keyup", () => {
                    //If all form camps are valid:
                    validCamps = util.validate.multiple(camps);
                    if(validCamps) {
                        flag = true;
                        formButton.classList.remove("disabled");
                    }
                    else {
                        flag = false;
                        if(!formButton.classList.contains("disabled")) formButton.classList.add("disabled");
                    }
                });
            });

            //Form button event
            util.toggleClick(formButton, () => {
                if(!flags.permanentDisableFormButton && flag){
                    formButton.classList.add("disabled");
                    formButton.classList.add("loading");
                    setTimeout(async () => {
                        const reEnableButton = await buttonCallback(validCamps);
                        if(reEnableButton === undefined){
                            console.log("undefined button");
                            formButton.classList.remove("disabled");
                            formButton.classList.remove("loading");
                        }
                        else {
                            flags.permanentDisableFormButton = true;
                            //formButton.classList.remove("loading");
                            kill.loginAndRegisterForms();
                            gen.userChat.init(reEnableButton);
                        }
                    },1000);
                }
            });
        }
    }
};