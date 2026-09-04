/* =========================================================
   SMART SLIP DETECTION SYSTEM
   MAIN JAVASCRIPT
========================================================= */


/* =========================================================
   SLIPBOT AI
========================================================= */

const aiOpenBtn = document.getElementById("ai-open-btn");
const aiCloseBtn = document.getElementById("ai-close-btn");
const aiOverlay = document.getElementById("ai-overlay");

const aiInput = document.getElementById("ai-input");
const aiSend = document.getElementById("ai-send");
const chatMessages = document.getElementById("chat-messages");

const aiStatusText = document.getElementById("ai-status-text");
const aiTypingIndicator =
    document.getElementById("ai-typing-indicator");


/* =========================================================
   SLIPBOT STATE
========================================================= */

let slipBotBusy = false;


/* =========================================================
   OPEN SLIPBOT
========================================================= */

if (aiOpenBtn) {

    aiOpenBtn.addEventListener("click", () => {

        aiOverlay.style.display = "flex";

        document.body.style.overflow = "hidden";

        setTimeout(() => {

            if (aiInput) {
                aiInput.focus();
            }

        }, 150);

        setAIStatus("SLIPBOT READY");

    });

}


/* =========================================================
   CLOSE SLIPBOT
========================================================= */

if (aiCloseBtn) {

    aiCloseBtn.addEventListener("click", () => {

        aiOverlay.style.display = "none";

        document.body.style.overflow = "";

        setAIStatus("SLIPBOT STANDBY");

    });

}


/* =========================================================
   CLOSE WITH ESCAPE
========================================================= */

document.addEventListener("keydown", (event) => {

    if (
        event.key === "Escape" &&
        aiOverlay &&
        aiOverlay.style.display === "flex"
    ) {

        aiOverlay.style.display = "none";

        document.body.style.overflow = "";

        setAIStatus("SLIPBOT STANDBY");

    }

});


/* =========================================================
   AI STATUS
========================================================= */

function setAIStatus(status) {

    if (aiStatusText) {
        aiStatusText.textContent = status;
    }

}


/* =========================================================
   TYPING INDICATOR
========================================================= */

function showTypingIndicator() {

    if (aiTypingIndicator) {
        aiTypingIndicator.style.display = "inline-block";
    }

}


function hideTypingIndicator() {

    if (aiTypingIndicator) {
        aiTypingIndicator.style.display = "none";
    }

}


/* =========================================================
   ADD USER MESSAGE
========================================================= */

function addUserMessage(text) {

    const message = document.createElement("div");

    message.className = "chat-message user user-message";

    message.textContent = text;

    chatMessages.appendChild(message);

    scrollChatToBottom();

}


/* =========================================================
   CREATE BOT MESSAGE
========================================================= */

function createBotMessage() {

    const message = document.createElement("div");

    message.className = "chat-message bot bot-message";

    message.innerHTML = `
        <div class="bot-message-header">

            <div class="mini-bot-icon">
                🤖
            </div>

            <span>
                SlipBot
            </span>

            <small>
                NOW
            </small>

        </div>

        <div class="bot-message-content"></div>
    `;

    chatMessages.appendChild(message);

    scrollChatToBottom();

    return message.querySelector(".bot-message-content");

}


/* =========================================================
   SCROLL CHAT
========================================================= */

function scrollChatToBottom() {

    if (!chatMessages) return;

    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: "smooth"
    });

}


/* =========================================================
   TYPE BOT RESPONSE
========================================================= */

async function typeBotMessage(element, text) {

    if (!element) return;

    element.textContent = "";

    const characters = [...text];

    /*
       Typing speed.
       Longer replies automatically become slightly faster.
    */

    let speed = 14;

    if (characters.length > 700) {
        speed = 7;
    }
    else if (characters.length > 400) {
        speed = 9;
    }

    for (let i = 0; i < characters.length; i++) {

        element.textContent += characters[i];

        /*
           Keep the latest text visible.
        */

        if (i % 3 === 0) {
            scrollChatToBottom();
        }

        await new Promise(resolve => {
            setTimeout(resolve, speed);
        });

    }

    scrollChatToBottom();

}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage() {

    if (slipBotBusy) return;

    const question = aiInput.value.trim();

    if (!question) return;


    /* -----------------------------------------
       USER MESSAGE
    ----------------------------------------- */

    addUserMessage(question);

    aiInput.value = "";

    slipBotBusy = true;

    aiSend.disabled = true;
    aiInput.disabled = true;


    /* -----------------------------------------
       STATUS
    ----------------------------------------- */

    setAIStatus("PROCESSING...");

    showTypingIndicator();


    /* -----------------------------------------
       BOT THINKING MESSAGE
    ----------------------------------------- */

    const botMessage = createBotMessage();

    botMessage.innerHTML = `
        <div class="thinking-bubble">

            <span>SlipBot is thinking</span>

            <div class="thinking-dots">
                <i></i>
                <i></i>
                <i></i>
            </div>

        </div>
    `;


    scrollChatToBottom();


    try {

        /* -----------------------------------------
           SEND TO RENDER BACKEND
        ----------------------------------------- */

        const response = await fetch(
            "https://smart-slip-detection.onrender.com/api/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: question
                })
            }
        );


        /* -----------------------------------------
           SERVER ERROR
        ----------------------------------------- */

        if (!response.ok) {

            let errorMessage =
                "Sorry, I couldn't connect to SlipBot.";

            try {

                const data = await response.json();

                if (data.error) {
                    errorMessage = data.error;
                }

            }
            catch (error) {

                console.error(
                    "Could not read server error:",
                    error
                );

            }


            botMessage.innerHTML = "";

            await typeBotMessage(
                botMessage,
                "⚠️ " + errorMessage
            );

            setAIStatus("CONNECTION ERROR");

            return;
        }


        /* -----------------------------------------
           IMPORTANT:
           BACKEND IS NON-STREAMING
        ----------------------------------------- */

        const reply = await response.text();


        if (!reply || !reply.trim()) {

            botMessage.innerHTML = "";

            await typeBotMessage(
                botMessage,
                "⚠️ SlipBot received an empty response."
            );

            setAIStatus("NO RESPONSE");

            return;
        }


        /* -----------------------------------------
           RESPONSE ARRIVED
        ----------------------------------------- */

        setAIStatus("RESPONSE READY");

        hideTypingIndicator();


        /* -----------------------------------------
           CLEAR THINKING UI
        ----------------------------------------- */

        botMessage.innerHTML = "";


        /* -----------------------------------------
           TYPE RESPONSE
        ----------------------------------------- */

        await typeBotMessage(
            botMessage,
            reply.trim()
        );


        /* -----------------------------------------
           READY AGAIN
        ----------------------------------------- */

        setAIStatus("SLIPBOT READY");

    }


    catch (error) {

        console.error(
            "SlipBot error:",
            error
        );


        botMessage.innerHTML = "";


        await typeBotMessage(
            botMessage,
            "⚠️ I couldn't reach the SlipBot server. Please try again in a moment."
        );


        setAIStatus("CONNECTION ERROR");

    }


    finally {

        hideTypingIndicator();

        slipBotBusy = false;

        aiSend.disabled = false;

        aiInput.disabled = false;

        aiInput.focus();


        /*
           Return to ready state after a short delay.
        */

        setTimeout(() => {

            if (!slipBotBusy) {
                setAIStatus("SLIPBOT READY");
            }

        }, 1800);

    }

}


/* =========================================================
   SEND BUTTON
========================================================= */

if (aiSend) {

    aiSend.addEventListener(
        "click",
        sendMessage
    );

}


/* =========================================================
   ENTER KEY
========================================================= */

if (aiInput) {

    aiInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );

}


/* =========================================================
   QUICK QUESTION BUTTONS
========================================================= */

document.addEventListener(
    "click",
    (event) => {

        const button =
            event.target.closest(".ai-suggestion");

        if (!button) return;

        const question =
            button.dataset.question;

        if (!question || slipBotBusy) return;

        aiInput.value = question;

        sendMessage();

    }
);


/* =========================================================
   SLIPBOT INITIAL STATE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        hideTypingIndicator();

        setAIStatus("SLIPBOT STANDBY");

    }
);



/* =========================================================
   SCROLL REVEAL SYSTEM
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =================================================
           HERO ANIMATION
        ================================================= */

        const hero =
            document.querySelector(".hero");


        if (hero) {

            const heroElements = [

                ".status-badge",

                ".hero h1",

                ".hero-description",

                ".hero-buttons",

                ".hero-stats",

                ".system-visual"

            ];


            heroElements.forEach(
                selector => {

                    const element =
                        document.querySelector(selector);

                    if (element) {

                        element.classList.add(
                            "hero-reveal"
                        );

                    }

                }
            );


            requestAnimationFrame(() => {

                setTimeout(() => {

                    hero.classList.add(
                        "hero-loaded"
                    );

                }, 100);

            });

        }



        /* =================================================
           SECTIONS
        ================================================= */

        const sections = [

            ".problem-section",

            ".solution-section",

            ".how-section",

            ".hardware-section",

            ".science-section",

            ".emergency-section",

            ".testing-section",

            ".video-section",

            ".project-section"

        ];


        sections.forEach(
            selector => {

                const section =
                    document.querySelector(selector);

                if (!section) return;


                const heading =
                    section.querySelector(

                        ":scope > .section-heading, " +

                        ":scope > .how-heading, " +

                        ":scope > .hardware-heading, " +

                        ":scope > .science-heading, " +

                        ":scope > .emergency-heading, " +

                        ":scope > .testing-heading, " +

                        ":scope > .project-heading, " +

                        ":scope > .video-heading"

                    );


                if (heading) {

                    heading.classList.add(
                        "scroll-heading"
                    );

                }


                const contentSelectors = {

                    ".problem-section": [
                        ".problem-grid"
                    ],

                    ".solution-section": [
                        ".solution-content",
                        ".solution-visual"
                    ],

                    ".how-section": [
                        ".detection-pipeline",
                        ".detection-principle"
                    ],

                    ".hardware-section": [
                        ".hardware-grid",
                        ".hardware-core"
                    ],

                    ".science-section": [
                        ".science-grid",
                        ".science-principle"
                    ],

                    ".emergency-section": [
                        ".alert-status",
                        ".emergency-flow",
                        ".communication-panel",
                        ".cancel-panel"
                    ],

                    ".testing-section": [
                        ".testing-dashboard",
                        ".applications-heading",
                        ".applications-grid",
                        ".prototype-note"
                    ],

                    ".video-section": [
                        ".project-video-container"
                    ],

                    ".project-section": [
                        ".project-summary",
                        ".team-heading",
                        ".team-grid",
                        ".project-final"
                    ]

                };


                const targets =
                    contentSelectors[selector] || [];


                targets.forEach(
                    targetSelector => {

                        const elements =
                            section.querySelectorAll(
                                targetSelector
                            );


                        elements.forEach(
                            element => {

                                element.classList.add(
                                    "scroll-reveal"
                                );

                            }
                        );

                    }
                );

            }
        );



        /* =================================================
           STAGGER GROUPS
        ================================================= */

        const staggerGroups = [

            ".problem-grid",

            ".detection-pipeline",

            ".hardware-grid",

            ".science-grid",

            ".emergency-flow",

            ".applications-grid",

            ".team-grid",

            ".summary-stats",

            ".test-sequence"

        ];


        staggerGroups.forEach(
            selector => {

                const group =
                    document.querySelector(selector);

                if (!group) return;

                group.classList.add(
                    "scroll-stagger"
                );

            }
        );



        /* =================================================
           LEFT SIDE REVEALS
        ================================================= */

        const leftElements = [

            ".solution-content",

            ".communication-info",

            ".summary-main"

        ];


        leftElements.forEach(
            selector => {

                const element =
                    document.querySelector(selector);

                if (!element) return;


                element.classList.remove(
                    "scroll-reveal"
                );


                element.classList.add(
                    "scroll-reveal-left"
                );

            }
        );



        /* =================================================
           RIGHT SIDE REVEALS
        ================================================= */

        const rightElements = [

            ".solution-visual",

            ".communication-screen"

        ];


        rightElements.forEach(
            selector => {

                const element =
                    document.querySelector(selector);

                if (!element) return;


                element.classList.remove(
                    "scroll-reveal"
                );


                element.classList.add(
                    "scroll-reveal-right"
                );

            }
        );



        /* =================================================
           SCALE REVEALS
        ================================================= */

        const scaleElements = [

            ".testing-dashboard",

            ".project-final",

            ".hardware-core",

            ".project-video-container"

        ];


        scaleElements.forEach(
            selector => {

                const element =
                    document.querySelector(selector);

                if (!element) return;


                element.classList.remove(
                    "scroll-reveal"
                );


                element.classList.add(
                    "scroll-reveal-scale"
                );

            }
        );



        /* =================================================
           FIND ALL REVEAL ELEMENTS
        ================================================= */

        const revealElements =
            document.querySelectorAll(

                ".scroll-reveal, " +

                ".scroll-reveal-left, " +

                ".scroll-reveal-right, " +

                ".scroll-reveal-scale, " +

                ".scroll-stagger, " +

                ".scroll-heading"

            );



        /* =================================================
           INTERSECTION OBSERVER
        ================================================= */

        if (
            "IntersectionObserver" in window
        ) {


            const observer =
                new IntersectionObserver(

                    (entries) => {

                        entries.forEach(
                            entry => {

                                if (
                                    entry.isIntersecting
                                ) {

                                    entry.target.classList.add(
                                        "revealed"
                                    );


                                    observer.unobserve(
                                        entry.target
                                    );

                                }

                            }
                        );

                    },


                    {

                        threshold: 0.12,

                        rootMargin:
                            "0px 0px -60px 0px"

                    }

                );


            revealElements.forEach(
                element => {

                    observer.observe(
                        element
                    );

                }
            );


        }
        else {

            revealElements.forEach(
                element => {

                    element.classList.add(
                        "revealed"
                    );

                }
            );

        }

    }
);



/* =========================================================
   NEURAL SENSOR NETWORK
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        const canvas =
            document.createElement("canvas");


        canvas.id =
            "neural-network-bg";


        document.body.prepend(
            canvas
        );


        const ctx =
            canvas.getContext("2d");


        const settings = {

            nodeCount:
                window.innerWidth < 700
                    ? 32
                    : 65,

            connectionDistance:
                window.innerWidth < 700
                    ? 120
                    : 155,

            nodeSpeed:
                0.18,

            pulseSpeed:
                0.018,

            mouseInfluence:
                80

        };


        let width;
        let height;
        let dpr;



        /* =================================================
           CANVAS RESIZE
        ================================================= */

        function resizeCanvas() {

            dpr =
                Math.min(
                    window.devicePixelRatio || 1,
                    2
                );


            width =
                window.innerWidth;


            height =
                window.innerHeight;


            canvas.width =
                width * dpr;


            canvas.height =
                height * dpr;


            canvas.style.width =
                width + "px";


            canvas.style.height =
                height + "px";


            ctx.setTransform(
                dpr,
                0,
                0,
                dpr,
                0,
                0
            );

        }


        resizeCanvas();


        window.addEventListener(
            "resize",
            resizeCanvas
        );



        /* =================================================
           MOUSE
        ================================================= */

        const mouse = {

            x: null,

            y: null

        };


        window.addEventListener(
            "mousemove",
            event => {

                mouse.x =
                    event.clientX;

                mouse.y =
                    event.clientY;

            }
        );


        window.addEventListener(
            "mouseleave",
            () => {

                mouse.x = null;

                mouse.y = null;

            }
        );



        /* =================================================
           NODE
        ================================================= */

        class Node {

            constructor() {

                this.x =
                    Math.random() * width;


                this.y =
                    Math.random() * height;


                this.vx =
                    (Math.random() - 0.5)
                    * settings.nodeSpeed;


                this.vy =
                    (Math.random() - 0.5)
                    * settings.nodeSpeed;


                this.radius =
                    Math.random() * 1.7 + 1;


                this.phase =
                    Math.random()
                    * Math.PI
                    * 2;


                this.pulse =
                    Math.random();

            }


            update() {

                this.x += this.vx;

                this.y += this.vy;


                if (this.x < -20) {

                    this.x =
                        width + 20;

                }


                if (this.x > width + 20) {

                    this.x =
                        -20;

                }


                if (this.y < -20) {

                    this.y =
                        height + 20;

                }


                if (this.y > height + 20) {

                    this.y =
                        -20;

                }


                if (
                    mouse.x !== null &&
                    mouse.y !== null
                ) {

                    const dx =
                        this.x - mouse.x;


                    const dy =
                        this.y - mouse.y;


                    const distance =
                        Math.sqrt(
                            dx * dx +
                            dy * dy
                        );


                    if (
                        distance <
                        settings.mouseInfluence
                    ) {

                        const force =
                            (
                                settings.mouseInfluence -
                                distance
                            )
                            /
                            settings.mouseInfluence;


                        this.x +=
                            (dx / distance || 0)
                            *
                            force
                            *
                            0.25;


                        this.y +=
                            (dy / distance || 0)
                            *
                            force
                            *
                            0.25;

                    }

                }


                this.phase +=
                    settings.pulseSpeed;

            }


            draw() {

                const glow =
                    (
                        Math.sin(
                            this.phase
                        ) + 1
                    )
                    / 2;


                const alpha =
                    0.35 +
                    glow * 0.35;


                ctx.beginPath();


                ctx.arc(

                    this.x,

                    this.y,

                    this.radius +
                    glow * 3,

                    0,

                    Math.PI * 2

                );


                ctx.fillStyle =
                    `rgba(0, 220, 255, ${alpha * 0.12})`;


                ctx.fill();


                ctx.beginPath();


                ctx.arc(

                    this.x,

                    this.y,

                    this.radius,

                    0,

                    Math.PI * 2

                );


                ctx.fillStyle =
                    `rgba(100, 235, 255, ${alpha})`;


                ctx.fill();

            }

        }



        /* =================================================
           CREATE NODES
        ================================================= */

        const nodes = [];


        for (
            let i = 0;
            i < settings.nodeCount;
            i++
        ) {

            nodes.push(
                new Node()
            );

        }



        /* =================================================
           CONNECTIONS
        ================================================= */

        function drawConnections() {

            for (
                let i = 0;
                i < nodes.length;
                i++
            ) {

                for (
                    let j = i + 1;
                    j < nodes.length;
                    j++
                ) {

                    const a =
                        nodes[i];


                    const b =
                        nodes[j];


                    const dx =
                        a.x - b.x;


                    const dy =
                        a.y - b.y;


                    const distance =
                        Math.sqrt(
                            dx * dx +
                            dy * dy
                        );


                    if (
                        distance <
                        settings.connectionDistance
                    ) {

                        const strength =
                            1 -
                            distance /
                            settings.connectionDistance;


                        ctx.beginPath();


                        ctx.moveTo(
                            a.x,
                            a.y
                        );


                        ctx.lineTo(
                            b.x,
                            b.y
                        );


                        ctx.strokeStyle =
                            `rgba(0,190,230,${strength * 0.11})`;


                        ctx.lineWidth =
                            0.7;


                        ctx.stroke();

                    }

                }

            }

        }



        /* =================================================
           SIGNAL PULSE
        ================================================= */

        let signalTimer = 0;

        let signalNode = null;


        function drawSignalPulse() {

            if (!signalNode) return;


            signalTimer += 0.025;


            const radius =
                signalTimer * 90;


            const alpha =
                Math.max(
                    0,
                    0.22 -
                    signalTimer * 0.025
                );


            if (alpha <= 0) {

                signalNode = null;

                signalTimer = 0;

                return;

            }


            ctx.beginPath();


            ctx.arc(

                signalNode.x,

                signalNode.y,

                radius,

                0,

                Math.PI * 2

            );


            ctx.strokeStyle =
                `rgba(0,220,255,${alpha})`;


            ctx.lineWidth =
                1;


            ctx.stroke();

        }



        /* =================================================
           RANDOM SIGNALS
        ================================================= */

        setInterval(
            () => {

                if (
                    Math.random() < 0.7
                ) {

                    signalNode =
                        nodes[
                            Math.floor(
                                Math.random()
                                *
                                nodes.length
                            )
                        ];


                    signalTimer = 0;

                }

            },
            3500
        );



        /* =================================================
           ANIMATION LOOP
        ================================================= */

        function animate() {

            ctx.clearRect(
                0,
                0,
                width,
                height
            );


            drawConnections();


            nodes.forEach(
                node => {

                    node.update();

                    node.draw();

                }
            );


            drawSignalPulse();


            requestAnimationFrame(
                animate
            );

        }


        animate();

    }
);