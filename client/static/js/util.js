const flags = {
    loginButtonEnabled: false,
    registerButtonEnabled: false
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
            buttonCallback: async data => {
                var finish = true;
                //Send login data through socket
                socket.emit("login", data);
                //Show server response with error or token
                socket.on("res", config => {
                    const {code, token, message} = config;
                    //If everything is ok
                    if(code == 200){
                        sessionStorage.token = token;
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

                    //Update active clients data
                    socket.on("active", activeUsers => {
                        console.log(activeUsers.filter(active => active.username != data.username));
                    });

                    finish = false;
                });
                
                await awaitResponse();
                async function awaitResponse(){
                    await util.asyncSetTimeOut(()=>{
                        if(finish) awaitResponse();
                    },500);
                }
            }
        });
        //Register form
        util.validate.form(registerForm, {
            flag: flags.registerButtonEnabled,
            buttonCallback: async data => {
                console.log(data);

                gen.formNotification({
                    append: container.querySelector("#register-f .camp-container .notifications"),
                    type: "error",
                    text: "el registro salio bien"
                });
            }
        });
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
                if(flag){
                    formButton.classList.add("disabled");
                    formButton.classList.add("loading");
                    setTimeout(async ()=>{
                        await buttonCallback(validCamps);
                        formButton.classList.remove("disabled");
                        formButton.classList.remove("loading");
                    },1000);
                }
            });
        }
    }
};