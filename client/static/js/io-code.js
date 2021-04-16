const code = {
    newWebClientConnection: usercount => {
        console.log(`user count: ${usercount}`);
        if(usercount != 1){
            const prevMessage = document.querySelector(".prompt-background");
            console.log(prevMessage);
            if(prevMessage) prevMessage.remove();
            body.append(gen.exceededConnections());
        }
        else kill.popWindow();
    }
};

const gen = {
    exceededConnections: () => {
        //Blur page content
        container.classList.add("blur");

        const exceeded = document.createElement("div");
        exceeded.classList.add("prompt-background");
        exceeded.classList.add("flex-centered");
        exceeded.id = "exceeded-connections";
        exceeded.innerHTML = `
            <div class="prompt-window flex-centered">
                <div class="content flex-centered">
                    ${gen.loadingAnimation()}
                    <div class="info">
                        <h2>Se ha detectado otra sesión abierta</h2>
                        <p>Unicamente se puede tener una sesión abierta por usuario.</p>
                        <p>Manten una sola sesión abierta para continuar...</p>
                    </div>
                </div>
            </div>
        `;
        setTimeout(()=>{
            exceeded.classList.add("open");
        },400);
        return exceeded;
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
                    <h2>Registrate</h2>
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
    popWindow: () => {
        const pop = document.querySelector(".prompt-background");
        pop.classList.add("close");
        setTimeout(()=>{
            container.classList.remove("blur");
            pop.remove();
        },300);
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
