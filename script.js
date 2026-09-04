/* =========================================
   SLIPBOT AI
========================================= */

const aiOpenBtn = document.getElementById("ai-open-btn");
const aiCloseBtn = document.getElementById("ai-close-btn");
const aiOverlay = document.getElementById("ai-overlay");

const aiInput = document.getElementById("ai-input");
const aiSend = document.getElementById("ai-send");
const chatMessages = document.getElementById("chat-messages");


/* =========================================
   OPEN
========================================= */

aiOpenBtn.addEventListener("click", () => {

    aiOverlay.style.display = "flex";

    document.body.style.overflow = "hidden";

    aiInput.focus();

});


/* =========================================
   CLOSE
========================================= */

aiCloseBtn.addEventListener("click", () => {

    aiOverlay.style.display = "none";

    document.body.style.overflow = "";

});


/* =========================================
   ADD USER MESSAGE
========================================= */

function addUserMessage(text) {

    const message = document.createElement("div");

    message.className = "user-message";

    message.textContent = text;

    chatMessages.appendChild(message);

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


/* =========================================
   CREATE BOT MESSAGE
========================================= */

function createBotMessage() {

    const message = document.createElement("div");

    message.className = "bot-message";

    message.textContent = "";

    chatMessages.appendChild(message);

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

    return message;

}


/* =========================================
   SEND MESSAGE
========================================= */

async function sendMessage() {

    const question =
        aiInput.value.trim();

    if (!question) return;


    /* Show user message */

    addUserMessage(question);

    aiInput.value = "";

    aiSend.disabled = true;

    aiInput.disabled = true;


    /* Create bot bubble */

    const botMessage =
        createBotMessage();

    botMessage.textContent =
        "🤖 SlipBot is thinking...";


    try {

        const response =
            await fetch(
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


        /* =====================================
           SERVER ERROR
        ===================================== */

        if (!response.ok) {

            let errorMessage =
                "⚠️ Sorry, I couldn't connect to the AI.";

            try {

                const data =
                    await response.json();

                if (data.error) {

                    errorMessage =
                        "⚠️ " + data.error;

                }

            } catch (error) {

                console.error(error);

            }

            botMessage.textContent =
                errorMessage;

            return;

        }


        /* =====================================
           READ RESPONSE
        ===================================== */

        const reader =
            response.body.getReader();

        const decoder =
            new TextDecoder("utf-8");


        let fullReply = "";

        let firstChunk = true;


        /* =====================================
           READ RESPONSE STREAM
        ===================================== */

        while (true) {

            const {
                value,
                done
            } = await reader.read();


            if (done) {
                break;
            }


            const chunk =
                decoder.decode(
                    value,
                    {
                        stream: true
                    }
                );


            if (firstChunk) {

                botMessage.textContent = "";

                firstChunk = false;

            }


            fullReply += chunk;

            botMessage.textContent =
                fullReply;


            chatMessages.scrollTop =
                chatMessages.scrollHeight;

        }


        /* =====================================
           FINISH UTF-8 DECODER
        ===================================== */

        const finalChunk =
            decoder.decode();

        if (finalChunk) {

            fullReply += finalChunk;

            botMessage.textContent =
                fullReply;

        }


    } catch (error) {

        console.error(
            "SlipBot error:",
            error
        );

        botMessage.textContent =
            "⚠️ I couldn't reach the SlipBot server. Make sure the SlipBot server is available.";

    }


    aiSend.disabled = false;

    aiInput.disabled = false;

    aiInput.focus();

}


/* =========================================
   SEND BUTTON
========================================= */

aiSend.addEventListener(
    "click",
    sendMessage
);


/* =========================================
   ENTER KEY
========================================= */

aiInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            event.preventDefault();

            sendMessage();

        }

    }
);


/* =========================================================
   SCROLL REVEAL SYSTEM
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =====================================
           HERO LOAD ANIMATION
        ===================================== */

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


            /* Small delay makes the entrance feel intentional */

            requestAnimationFrame(() => {

                setTimeout(() => {

                    hero.classList.add(
                        "hero-loaded"
                    );

                }, 100);

            });

        }


        /* =====================================
           MAJOR SECTION REVEALS
        ===================================== */

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
            (selector, index) => {

                const section =
                    document.querySelector(selector);

                if (!section) return;


                /*
                 * Find the main heading inside
                 * the section.
                 */

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


                /*
                 * Reveal the major content
                 * without touching elements
                 * that already have their own
                 * transform animations.
                 */

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


        /* =====================================
           STAGGER CARD GROUPS
        ===================================== */

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


        /* =====================================
           SPECIAL LEFT / RIGHT REVEALS
        ===================================== */

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


        /* =====================================
           SCALE-IN ELEMENTS
        ===================================== */

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


        /* =====================================
           INTERSECTION OBSERVER
        ===================================== */

        const revealElements =
            document.querySelectorAll(
                ".scroll-reveal, " +
                ".scroll-reveal-left, " +
                ".scroll-reveal-right, " +
                ".scroll-reveal-scale, " +
                ".scroll-stagger, " +
                ".scroll-heading"
            );


        if (
            "IntersectionObserver"
            in window
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


                                    /*
                                     * Once the animation has
                                     * played, stop watching it.
                                     * This prevents the animation
                                     * from replaying every time
                                     * the user scrolls.
                                     */

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

        } else {

            /*
             * Fallback for very old browsers.
             */

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

document.addEventListener("DOMContentLoaded", () => {

    /* -----------------------------------------------------
       CREATE CANVAS
    ----------------------------------------------------- */

    const canvas =
        document.createElement("canvas");

    canvas.id =
        "neural-network-bg";

    document.body.prepend(canvas);


    const ctx =
        canvas.getContext("2d");


    /* -----------------------------------------------------
       SETTINGS
    ----------------------------------------------------- */

    const settings = {

        nodeCount:
            window.innerWidth < 700 ? 32 : 65,

        connectionDistance:
            window.innerWidth < 700 ? 120 : 155,

        nodeSpeed:
            0.18,

        pulseSpeed:
            0.018,

        mouseInfluence:
            80

    };


    /* -----------------------------------------------------
       CANVAS SIZE
    ----------------------------------------------------- */

    let width;
    let height;
    let dpr;


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


    /* -----------------------------------------------------
       MOUSE
    ----------------------------------------------------- */

    const mouse = {

        x: null,
        y: null

    };


    window.addEventListener(
        "mousemove",
        (event) => {

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


    /* -----------------------------------------------------
       NODE CLASS
    ----------------------------------------------------- */

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
                Math.random() * Math.PI * 2;


            this.pulse =
                Math.random();

        }


        update() {

            this.x += this.vx;
            this.y += this.vy;


            /* ---------------------------------------------
               SCREEN WRAP
            --------------------------------------------- */

            if (this.x < -20)
                this.x = width + 20;

            if (this.x > width + 20)
                this.x = -20;

            if (this.y < -20)
                this.y = height + 20;

            if (this.y > height + 20)
                this.y = -20;


            /* ---------------------------------------------
               VERY SUBTLE MOUSE INTERACTION
            --------------------------------------------- */

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
                        (settings.mouseInfluence - distance)
                        / settings.mouseInfluence;


                    this.x +=
                        (dx / distance || 0)
                        * force
                        * 0.25;

                    this.y +=
                        (dy / distance || 0)
                        * force
                        * 0.25;

                }

            }


            /* ---------------------------------------------
               PULSE
            --------------------------------------------- */

            this.phase +=
                settings.pulseSpeed;

        }


        draw() {

            const glow =
                (
                    Math.sin(this.phase)
                    + 1
                ) / 2;


            const alpha =
                0.35 +
                glow * 0.35;


            /* Outer glow */

            ctx.beginPath();

            ctx.arc(
                this.x,
                this.y,
                this.radius + glow * 3,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                `rgba(0, 220, 255, ${alpha * 0.12})`;

            ctx.fill();


            /* Actual node */

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


    /* -----------------------------------------------------
       CREATE NODES
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       DRAW CONNECTIONS
    ----------------------------------------------------- */

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
                        (
                            distance /
                            settings.connectionDistance
                        );


                    /*
                     * Keep the lines extremely
                     * subtle so they don't
                     * compete with content.
                     */

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
                        `rgba(
                            0,
                            190,
                            230,
                            ${strength * 0.11}
                        )`;


                    ctx.lineWidth =
                        0.7;


                    ctx.stroke();

                }

            }

        }

    }


    /* -----------------------------------------------------
       OCCASIONAL SIGNAL PULSE
    ----------------------------------------------------- */

    let signalTimer = 0;

    let signalNode = null;


    function drawSignalPulse() {

        if (!signalNode)
            return;


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
            `rgba(
                0,
                220,
                255,
                ${alpha}
            )`;


        ctx.lineWidth =
            1;


        ctx.stroke();

    }


    /* -----------------------------------------------------
       RANDOM SIGNAL
    ----------------------------------------------------- */

    setInterval(
        () => {

            if (
                Math.random() <
                0.7
            ) {

                signalNode =
                    nodes[
                        Math.floor(
                            Math.random()
                            * nodes.length
                        )
                    ];

                signalTimer =
                    0;

            }

        },
        3500
    );


    /* -----------------------------------------------------
       ANIMATION LOOP
    ----------------------------------------------------- */

    function animate() {

        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        /* Connections first */

        drawConnections();


        /* Nodes */

        nodes.forEach(
            node => {

                node.update();

                node.draw();

            }
        );


        /* Signal pulse */

        drawSignalPulse();


        requestAnimationFrame(
            animate
        );

    }


    animate();

});