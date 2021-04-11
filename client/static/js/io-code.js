const code = {
    newWebClientConnection: usercount => {
        console.log(`user count: ${usercount}`);
        if(usercount != 1){
            const prevMessage = document.querySelector(".prompt-backgrund");
            if(prevMessage) kill.popWindow();
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
    }
};

const kill = {
    popWindow: () => {
        const pop = document.querySelector(".prompt-background");
        pop.classList.add("close");
        setTimeout(()=>{
            container.classList.remove("blur");
        },300);
    }
}; 
