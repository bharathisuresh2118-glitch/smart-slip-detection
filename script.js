
/* =========================================================
   SMART SLIP DETECTION SYSTEM
   MAIN JAVASCRIPT
========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
========================================================= */

const SLIPBOT_API_URL =
    "https://smart-slip-detection.onrender.com/api/chat";

const REQUEST_TIMEOUT = 30000;


/* =========================================================
   SLIPBOT MEMORY CONFIGURATION
========================================================= */

const MEMORY_KEY =
    "slipbot_conversations_v1";

const ACTIVE_CHAT_KEY =
    "slipbot_active_chat_v1";

const MAX_STORED_MESSAGES =
    50;

const MAX_AI_HISTORY =
    20;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log(
        "Smart Slip Detection System JS loaded."
    );

    initSlipBot();
    initScrollReveal();
    initNeuralNetwork();

});


/* =========================================================
   SLIPBOT AI
========================================================= */

function initSlipBot() {

    console.log(
        "Initializing SlipBot..."
    );


    /* -----------------------------------------------------
       ELEMENTS
    ----------------------------------------------------- */

    const aiOpenBtn =
        document.getElementById(
            "ai-open-btn"
        );

    const aiCloseBtn =
        document.getElementById(
            "ai-close-btn"
        );

    const aiFullscreenBtn =
        document.getElementById(
            "ai-fullscreen-btn"
        );

    const aiNewChatBtn =
        document.getElementById(
            "ai-new-chat-btn"
        );

    const aiClearMemoryBtn =
        document.getElementById(
            "ai-clear-memory-btn"
        );

    const aiOverlay =
        document.getElementById(
            "ai-overlay"
        );

    const aiInput =
        document.getElementById(
            "ai-input"
        );

    const aiSend =
        document.getElementById(
            "ai-send"
        );

    const chatMessages =
        document.getElementById(
            "chat-messages"
        );

    const aiStatusText =
        document.getElementById(
            "ai-status-text"
        );

    const aiTypingIndicator =
        document.getElementById(
            "ai-typing-indicator"
        );


    /* -----------------------------------------------------
       ELEMENT CHECK
    ----------------------------------------------------- */

    if (!aiOpenBtn) {

        console.error(
            "SlipBot error: #ai-open-btn not found."
        );

    }

    if (!aiCloseBtn) {

        console.error(
            "SlipBot error: #ai-close-btn not found."
        );

    }

    if (!aiFullscreenBtn) {

        console.warn(
            "SlipBot warning: #ai-fullscreen-btn not found."
        );

    }

    if (!aiNewChatBtn) {

        console.warn(
            "SlipBot warning: #ai-new-chat-btn not found."
        );

    }

    if (!aiClearMemoryBtn) {

        console.warn(
            "SlipBot warning: #ai-clear-memory-btn not found."
        );

    }

    if (!aiOverlay) {

        console.error(
            "SlipBot error: #ai-overlay not found."
        );

    }

    if (!aiInput) {

        console.error(
            "SlipBot error: #ai-input not found."
        );

    }

    if (!aiSend) {

        console.error(
            "SlipBot error: #ai-send not found."
        );

    }

    if (!chatMessages) {

        console.error(
            "SlipBot error: #chat-messages not found."
        );

    }


    /* =====================================================
       STATE
    ===================================================== */

    let slipBotBusy =
        false;


    let conversations =
        {};

    let activeChatId =
        null;


    /* =====================================================
       MEMORY SYSTEM
    ===================================================== */

    function generateChatId() {

        return (
            "chat_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 9)
        );

    }


    /* -----------------------------------------------------
       LOAD MEMORY
    ----------------------------------------------------- */

    function loadMemory() {

        try {

            const stored =
                localStorage.getItem(
                    MEMORY_KEY
                );


            if (stored) {

                const parsed =
                    JSON.parse(
                        stored
                    );


                if (
                    parsed &&
                    typeof parsed ===
                        "object" &&
                    !Array.isArray(
                        parsed
                    )
                ) {

                    conversations =
                        parsed;

                }
                else {

                    conversations =
                        {};

                }

            }
            else {

                conversations =
                    {};

            }


            activeChatId =
                localStorage.getItem(
                    ACTIVE_CHAT_KEY
                );


            if (
                !activeChatId ||
                !conversations[
                    activeChatId
                ]
            ) {

                activeChatId =
                    generateChatId();


                conversations[
                    activeChatId
                ] = {

                    id:
                        activeChatId,

                    createdAt:
                        Date.now(),

                    updatedAt:
                        Date.now(),

                    messages:
                        []

                };


                saveMemory();

            }


            console.log(
                "SlipBot memory loaded.",
                Object.keys(
                    conversations
                ).length,
                "conversation(s)"
            );

        }
        catch (error) {

            console.error(
                "Could not load SlipBot memory:",
                error
            );


            conversations =
                {};

            activeChatId =
                generateChatId();


            conversations[
                activeChatId
            ] = {

                id:
                    activeChatId,

                createdAt:
                    Date.now(),

                updatedAt:
                    Date.now(),

                messages:
                    []

            };


            saveMemory();

        }

    }


    /* -----------------------------------------------------
       SAVE MEMORY
    ----------------------------------------------------- */

    function saveMemory() {

        try {

            localStorage.setItem(
                MEMORY_KEY,
                JSON.stringify(
                    conversations
                )
            );


            if (activeChatId) {

                localStorage.setItem(
                    ACTIVE_CHAT_KEY,
                    activeChatId
                );

            }


            console.log(
                "SlipBot memory saved."
            );

        }
        catch (error) {

            console.error(
                "Could not save SlipBot memory:",
                error
            );

        }

    }


    /* -----------------------------------------------------
       GET CURRENT CHAT
    ----------------------------------------------------- */

    function getCurrentChat() {

        if (
            !activeChatId ||
            !conversations[
                activeChatId
            ]
        ) {

            return null;

        }


        return conversations[
            activeChatId
        ];

    }


    /* -----------------------------------------------------
       REMEMBER MESSAGE
    ----------------------------------------------------- */

    function rememberMessage(
        role,
        content
    ) {

        const chat =
            getCurrentChat();


        if (!chat) {
            return;
        }


        if (
            role !== "user" &&
            role !== "assistant"
        ) {

            return;

        }


        if (
            typeof content !==
                "string"
        ) {

            return;

        }


        const cleanContent =
            content.trim();


        if (!cleanContent) {
            return;
        }


        chat.messages.push({

            role:
                role,

            content:
                cleanContent,

            timestamp:
                Date.now()

        });


        /* -------------------------------------------------
           KEEP MEMORY SIZE UNDER CONTROL
        ------------------------------------------------- */

        if (
            chat.messages.length >
            MAX_STORED_MESSAGES
        ) {

            chat.messages =
                chat.messages.slice(
                    -MAX_STORED_MESSAGES
                );

        }


        chat.updatedAt =
            Date.now();


        saveMemory();

    }


    /* -----------------------------------------------------
       GET AI HISTORY
    ----------------------------------------------------- */

    function getAIHistory() {

        const chat =
            getCurrentChat();


        if (
            !chat ||
            !Array.isArray(
                chat.messages
            )
        ) {

            return [];

        }


        return chat.messages
            .slice(
                -MAX_AI_HISTORY
            )
            .map(
                message => ({

                    role:
                        message.role,

                    content:
                        message.content

                })
            );

    }


    /* -----------------------------------------------------
       CREATE NEW CHAT
    ----------------------------------------------------- */

    function createNewChat() {

        if (slipBotBusy) {

            console.warn(
                "Cannot create a new chat while SlipBot is busy."
            );

            return;

        }


        activeChatId =
            generateChatId();


        conversations[
            activeChatId
        ] = {

            id:
                activeChatId,

            createdAt:
                Date.now(),

            updatedAt:
                Date.now(),

            messages:
                []

        };


        saveMemory();


        restoreCurrentChat();


        setAIStatus(
            "NEW CHAT READY"
        );


        console.log(
            "New SlipBot conversation created:",
            activeChatId
        );


        setTimeout(
            () => {

                setAIStatus(
                    "SLIPBOT READY"
                );

            },
            1500
        );

    }


    /* -----------------------------------------------------
       CLEAR ALL MEMORY
    ----------------------------------------------------- */

    function clearMemory() {

        if (slipBotBusy) {

            console.warn(
                "Cannot clear memory while SlipBot is busy."
            );

            return;

        }


        const confirmed =
            window.confirm(
                "Clear all SlipBot conversation memory? This cannot be undone."
            );


        if (!confirmed) {
            return;
        }


        conversations =
            {};

        activeChatId =
            generateChatId();


        conversations[
            activeChatId
        ] = {

            id:
                activeChatId,

            createdAt:
                Date.now(),

            updatedAt:
                Date.now(),

            messages:
                []

        };


        saveMemory();


        restoreCurrentChat();


        setAIStatus(
            "MEMORY CLEARED"
        );


        setTimeout(
            () => {

                setAIStatus(
                    "SLIPBOT READY"
                );

            },
            1500
        );


        console.log(
            "All SlipBot conversation memory cleared."
        );

    }


    /* -----------------------------------------------------
       RESTORE CURRENT CHAT
    ----------------------------------------------------- */

    function restoreCurrentChat() {

        if (!chatMessages) {
            return;
        }


        chatMessages.innerHTML =
            "";


        const chat =
            getCurrentChat();


        if (
            !chat ||
            !Array.isArray(
                chat.messages
            ) ||
            chat.messages.length ===
                0
        ) {

            const welcome =
                document.createElement(
                    "div"
                );


            welcome.className =
                "chat-message bot bot-message";


            welcome.innerHTML = `

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

                <div class="bot-message-content">

                    Hello! I'm SlipBot, the AI assistant for the Smart Slip Detection System.

                    Ask me about the project, its sensors, how fall detection works, the science behind it, or anything else you're curious about.

                </div>

            `;


            chatMessages.appendChild(
                welcome
            );


            scrollChatToBottom();


            return;

        }


        chat.messages.forEach(
            message => {

                if (
                    message.role ===
                    "user"
                ) {

                    addUserMessage(
                        message.content
                    );

                }
                else if (
                    message.role ===
                    "assistant"
                ) {

                    addStoredBotMessage(
                        message.content
                    );

                }

            }
        );


        scrollChatToBottom();

    }


    /* -----------------------------------------------------
       ADD STORED BOT MESSAGE
    ----------------------------------------------------- */

    function addStoredBotMessage(
        text
    ) {

        if (!chatMessages) {
            return;
        }


        const message =
            document.createElement(
                "div"
            );


        message.className =
            "chat-message bot bot-message";


        message.innerHTML = `

            <div class="bot-message-header">

                <div class="mini-bot-icon">
                    🤖
                </div>

                <span>
                    SlipBot
                </span>

                <small>
                    MEMORY
                </small>

            </div>

            <div class="bot-message-content"></div>

        `;


        const content =
            message.querySelector(
                ".bot-message-content"
            );


        if (content) {

            content.textContent =
                text;

        }


        chatMessages.appendChild(
            message
        );

    }


    /* =====================================================
       STATUS
    ===================================================== */

    function setAIStatus(
        status
    ) {

        if (aiStatusText) {

            aiStatusText.textContent =
                status;

        }


        console.log(
            "SlipBot status:",
            status
        );

    }


    /* =====================================================
       TYPING INDICATOR
    ===================================================== */

    function showTypingIndicator() {

        if (aiTypingIndicator) {

            aiTypingIndicator.style.display =
                "inline-block";

        }

    }


    function hideTypingIndicator() {

        if (aiTypingIndicator) {

            aiTypingIndicator.style.display =
                "none";

        }

    }


    /* =====================================================
       OPEN SLIPBOT
    ===================================================== */

    if (
        aiOpenBtn &&
        aiOverlay
    ) {

        aiOpenBtn.addEventListener(
            "click",
            (event) => {

                event.preventDefault();
                event.stopPropagation();


                aiOverlay.classList.add(
                    "active"
                );


                document.body.style.overflow =
                    "hidden";


                setAIStatus(
                    "SLIPBOT READY"
                );


                setTimeout(
                    () => {

                        if (aiInput) {

                            aiInput.focus();

                        }

                    },
                    300
                );

            }
        );

    }


    /* =====================================================
       CLOSE SLIPBOT
    ===================================================== */

    if (
        aiCloseBtn &&
        aiOverlay
    ) {

        aiCloseBtn.addEventListener(
            "click",
            (event) => {

                event.preventDefault();
                event.stopPropagation();


                aiOverlay.classList.remove(
                    "active"
                );


                aiOverlay.classList.remove(
                    "fullscreen"
                );


                document.body.style.overflow =
                    "";


                if (aiFullscreenBtn) {

                    aiFullscreenBtn.title =
                        "Full screen";

                }


                setAIStatus(
                    "SLIPBOT STANDBY"
                );

            }
        );

    }


    /* =====================================================
       FULLSCREEN TOGGLE
    ===================================================== */

    if (
        aiFullscreenBtn &&
        aiOverlay
    ) {

        aiFullscreenBtn.addEventListener(
            "click",
            (event) => {

                event.preventDefault();
                event.stopPropagation();


                const isFullscreen =
                    aiOverlay.classList.toggle(
                        "fullscreen"
                    );


                aiFullscreenBtn.title =
                    isFullscreen
                        ? "Exit full screen"
                        : "Full screen";

            }
        );

    }


    /* =====================================================
       NEW CHAT BUTTON
    ===================================================== */

    if (aiNewChatBtn) {

        aiNewChatBtn.addEventListener(
            "click",
            (event) => {

                event.preventDefault();
                event.stopPropagation();


                createNewChat();

            }
        );

    }


    /* =====================================================
       CLEAR MEMORY BUTTON
    ===================================================== */

    if (aiClearMemoryBtn) {

        aiClearMemoryBtn.addEventListener(
            "click",
            (event) => {

                event.preventDefault();
                event.stopPropagation();


                clearMemory();

            }
        );

    }


    /* =====================================================
       CLOSE WHEN CLICKING OUTSIDE WINDOW
    ===================================================== */

    if (aiOverlay) {

        aiOverlay.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    aiOverlay
                ) {

                    aiOverlay.classList.remove(
                        "active"
                    );


                    aiOverlay.classList.remove(
                        "fullscreen"
                    );


                    document.body.style.overflow =
                        "";


                    if (aiFullscreenBtn) {

                        aiFullscreenBtn.title =
                            "Full screen";

                    }


                    setAIStatus(
                        "SLIPBOT STANDBY"
                    );

                }

            }
        );

    }


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key ===
                    "Escape" &&
                aiOverlay &&
                aiOverlay.classList.contains(
                    "active"
                )
            ) {

                aiOverlay.classList.remove(
                    "active"
                );


                aiOverlay.classList.remove(
                    "fullscreen"
                );


                document.body.style.overflow =
                    "";


                if (aiFullscreenBtn) {

                    aiFullscreenBtn.title =
                        "Full screen";

                }


                setAIStatus(
                    "SLIPBOT STANDBY"
                );

            }

        }
    );


    /* =====================================================
       ADD USER MESSAGE
    ===================================================== */

    function addUserMessage(
        text
    ) {

        if (!chatMessages) {
            return;
        }


        const message =
            document.createElement(
                "div"
            );


        message.className =
            "chat-message user user-message";


        message.textContent =
            text;


        chatMessages.appendChild(
            message
        );


        scrollChatToBottom();

    }


    /* =====================================================
       CREATE BOT MESSAGE
    ===================================================== */

    function createBotMessage() {

        if (!chatMessages) {
            return null;
        }


        const message =
            document.createElement(
                "div"
            );


        message.className =
            "chat-message bot bot-message";


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


        chatMessages.appendChild(
            message
        );


        scrollChatToBottom();


        return message.querySelector(
            ".bot-message-content"
        );

    }


    /* =====================================================
       SCROLL CHAT
    ===================================================== */

    function scrollChatToBottom() {

        if (!chatMessages) {
            return;
        }


        chatMessages.scrollTo({

            top:
                chatMessages.scrollHeight,

            behavior:
                "smooth"

        });

    }


    /* =====================================================
       TYPE BOT RESPONSE
    ===================================================== */

    async function typeBotMessage(
        element,
        text
    ) {

        if (!element) {
            return;
        }


        element.textContent =
            "";


        const characters =
            [...String(text)];


        let speed =
            12;


        if (
            characters.length >
            900
        ) {

            speed =
                5;

        }
        else if (
            characters.length >
            600
        ) {

            speed =
                7;

        }
        else if (
            characters.length >
            300
        ) {

            speed =
                9;

        }


        for (
            let i = 0;
            i < characters.length;
            i++
        ) {

            element.textContent +=
                characters[i];


            if (
                i % 3 ===
                0
            ) {

                scrollChatToBottom();

            }


            await new Promise(
                resolve => {

                    setTimeout(
                        resolve,
                        speed
                    );

                }
            );

        }


        scrollChatToBottom();

    }


    /* =====================================================
       REQUEST WITH TIMEOUT
    ===================================================== */

    async function fetchWithTimeout(
        url,
        options,
        timeout
    ) {

        const controller =
            new AbortController();


        const timeoutId =
            setTimeout(
                () => {

                    controller.abort();

                },
                timeout
            );


        try {

            return await fetch(
                url,
                {
                    ...options,
                    signal:
                        controller.signal
                }
            );

        }
        finally {

            clearTimeout(
                timeoutId
            );

        }

    }


    /* =====================================================
       READ BACKEND RESPONSE
    ===================================================== */

    async function readBackendResponse(
        response
    ) {

        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        /* -------------------------------------------------
           JSON RESPONSE
        ------------------------------------------------- */

        if (
            contentType
                .toLowerCase()
                .includes(
                    "application/json"
                )
        ) {

            const data =
                await response.json();


            if (
                data &&
                typeof data.answer ===
                    "string"
            ) {

                return data.answer;

            }


            if (
                data &&
                typeof data.message ===
                    "string"
            ) {

                return data.message;

            }


            if (
                data &&
                typeof data.response ===
                    "string"
            ) {

                return data.response;

            }


            if (
                data &&
                typeof data.error ===
                    "string"
            ) {

                return (
                    "⚠️ " +
                    data.error
                );

            }


            return JSON.stringify(
                data
            );

        }


        /* -------------------------------------------------
           TEXT RESPONSE
        ------------------------------------------------- */

        return await response.text();

    }


    /* =====================================================
       SEND MESSAGE
    ===================================================== */

    async function sendMessage() {

        if (slipBotBusy) {
            return;
        }


        if (!aiInput) {

            console.error(
                "SlipBot error: input element missing."
            );

            return;

        }


        if (!aiSend) {

            console.error(
                "SlipBot error: send button missing."
            );

            return;

        }


        const question =
            aiInput.value.trim();


        if (!question) {
            return;
        }


        /* =================================================
           IMPORTANT MEMORY STEP
           Capture history BEFORE adding the new question.
        ================================================= */

        const history =
            getAIHistory();


        console.log(
            "Sending conversation memory:",
            history.length,
            "messages"
        );


        /* -------------------------------------------------
           USER MESSAGE UI
        ------------------------------------------------- */

        addUserMessage(
            question
        );


        aiInput.value =
            "";


        /* -------------------------------------------------
           SAVE USER MESSAGE
        ------------------------------------------------- */

        rememberMessage(
            "user",
            question
        );


        /* -------------------------------------------------
           LOCK UI
        ------------------------------------------------- */

        slipBotBusy =
            true;


        aiSend.disabled =
            true;


        aiInput.disabled =
            true;


        /* -------------------------------------------------
           STATUS
        ------------------------------------------------- */

        setAIStatus(
            "CONNECTING TO SLIPBOT..."
        );


        showTypingIndicator();


        /* -------------------------------------------------
           BOT MESSAGE
        ------------------------------------------------- */

        const botMessage =
            createBotMessage();


        if (!botMessage) {

            console.error(
                "SlipBot error: could not create bot message."
            );


            slipBotBusy =
                false;


            aiSend.disabled =
                false;


            aiInput.disabled =
                false;


            hideTypingIndicator();


            return;

        }


        /* -------------------------------------------------
           THINKING UI
        ------------------------------------------------- */

        botMessage.innerHTML = `

            <div class="thinking-bubble">

                <span>
                    SlipBot is thinking
                </span>

                <div class="thinking-dots">

                    <i></i>
                    <i></i>
                    <i></i>

                </div>

            </div>

        `;


        scrollChatToBottom();


        /* =================================================
           API REQUEST
        ================================================= */

        try {

            console.log(
                "Sending SlipBot request:",
                question
            );


            const response =
                await fetchWithTimeout(

                    SLIPBOT_API_URL,

                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "text/plain, application/json"

                        },

                        body:
                            JSON.stringify({

                                message:
                                    question,

                                history:
                                    history

                            })

                    },

                    REQUEST_TIMEOUT

                );


            console.log(
                "SlipBot HTTP status:",
                response.status
            );


            /* -------------------------------------------------
               HTTP ERROR
            ------------------------------------------------- */

            if (!response.ok) {

                let serverMessage =
                    "";


                try {

                    serverMessage =
                        await readBackendResponse(
                            response
                        );

                }
                catch (readError) {

                    console.error(
                        "Could not read backend error:",
                        readError
                    );

                }


                botMessage.innerHTML =
                    "";


                let displayError =
                    "SlipBot server returned HTTP " +
                    response.status +
                    ".";


                if (
                    serverMessage &&
                    serverMessage.trim()
                ) {

                    displayError +=
                        "\n\n" +
                        serverMessage.trim();

                }


                await typeBotMessage(

                    botMessage,

                    "⚠️ " +
                    displayError

                );


                setAIStatus(
                    "SERVER ERROR"
                );


                console.error(
                    "SlipBot backend error:",
                    response.status,
                    serverMessage
                );


                /* -------------------------------------------------
                   REMOVE USER MESSAGE FROM MEMORY
                   Because the request failed.
                ------------------------------------------------- */

                const failedChat =
                    getCurrentChat();


                if (
                    failedChat &&
                    Array.isArray(
                        failedChat.messages
                    )
                ) {

                    failedChat.messages =
                        failedChat.messages.filter(
                            message =>
                                !(
                                    message.role ===
                                        "user" &&
                                    message.content ===
                                        question &&
                                    message.timestamp >=
                                        Date.now() -
                                        10000
                                )
                        );


                    saveMemory();

                }


                return;

            }


            /* -------------------------------------------------
               READ RESPONSE
            ------------------------------------------------- */

            const reply =
                await readBackendResponse(
                    response
                );


            console.log(
                "SlipBot response:",
                reply
            );


            /* -------------------------------------------------
               EMPTY RESPONSE
            ------------------------------------------------- */

            if (
                !reply ||
                !reply.trim()
            ) {

                botMessage.innerHTML =
                    "";


                await typeBotMessage(

                    botMessage,

                    "⚠️ SlipBot connected, but the server returned an empty response."

                );


                setAIStatus(
                    "EMPTY RESPONSE"
                );


                return;

            }


            /* -------------------------------------------------
               RESPONSE READY
            ------------------------------------------------- */

            hideTypingIndicator();


            setAIStatus(
                "RESPONSE RECEIVED"
            );


            /* -------------------------------------------------
               CLEAR THINKING UI
            ------------------------------------------------- */

            botMessage.innerHTML =
                "";


            /* -------------------------------------------------
               TYPE RESPONSE
            ------------------------------------------------- */

            await typeBotMessage(

                botMessage,

                reply.trim()

            );


            /* -------------------------------------------------
               SAVE AI RESPONSE TO MEMORY
            ------------------------------------------------- */

            rememberMessage(

                "assistant",

                reply.trim()

            );


            /* -------------------------------------------------
               READY
            ------------------------------------------------- */

            setAIStatus(
                "SLIPBOT READY"
            );

        }


        /* =================================================
           ERROR HANDLING
        ================================================= */

        catch (error) {

            console.error(
                "SlipBot request failed:",
                error
            );


            botMessage.innerHTML =
                "";


            /* -------------------------------------------------
               REMOVE FAILED USER MESSAGE
            ------------------------------------------------- */

            const failedChat =
                getCurrentChat();


            if (
                failedChat &&
                Array.isArray(
                    failedChat.messages
                )
            ) {

                failedChat.messages =
                    failedChat.messages.filter(
                        message =>
                            !(
                                message.role ===
                                    "user" &&
                                message.content ===
                                    question &&
                                message.timestamp >=
                                    Date.now() -
                                    10000
                            )
                    );


                saveMemory();

            }


            /* -------------------------------------------------
               TIMEOUT
            ------------------------------------------------- */

            if (
                error &&
                error.name ===
                    "AbortError"
            ) {

                await typeBotMessage(

                    botMessage,

                    "⚠️ SlipBot took too long to respond. The server may be waking up. Please try again."

                );


                setAIStatus(
                    "REQUEST TIMEOUT"
                );

            }


            /* -------------------------------------------------
               NETWORK ERROR
            ------------------------------------------------- */

            else {

                await typeBotMessage(

                    botMessage,

                    "⚠️ I couldn't reach the SlipBot server. Please check the connection and try again."

                );


                setAIStatus(
                    "CONNECTION ERROR"
                );

            }

        }


        /* =================================================
           UNLOCK UI
        ================================================= */

        finally {

            hideTypingIndicator();


            slipBotBusy =
                false;


            aiSend.disabled =
                false;


            aiInput.disabled =
                false;


            aiInput.focus();


            setTimeout(
                () => {

                    if (!slipBotBusy) {

                        setAIStatus(
                            "SLIPBOT READY"
                        );

                    }

                },
                1800
            );

        }

    }


    /* =====================================================
       SEND BUTTON
    ===================================================== */

    if (aiSend) {

        aiSend.addEventListener(
            "click",
            (event) => {

                event.preventDefault();


                sendMessage();

            }
        );

    }


    /* =====================================================
       ENTER KEY
    ===================================================== */

    if (aiInput) {

        aiInput.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key ===
                        "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();


                    sendMessage();

                }

            }
        );

    }


    /* =====================================================
       QUICK QUESTIONS
    ===================================================== */

    document.addEventListener(
        "click",
        (event) => {

            const button =
                event.target.closest(
                    ".ai-suggestion"
                );


            if (!button) {
                return;
            }


            event.preventDefault();


            if (slipBotBusy) {
                return;
            }


            const question =
                button.dataset.question;


            if (
                !question ||
                !aiInput
            ) {

                return;

            }


            /* -------------------------------------------------
               OPEN SLIPBOT IF NECESSARY
            ------------------------------------------------- */

            if (
                aiOverlay &&
                !aiOverlay.classList.contains(
                    "active"
                )
            ) {

                aiOverlay.classList.add(
                    "active"
                );


                document.body.style.overflow =
                    "hidden";

            }


            aiInput.value =
                question;


            sendMessage();

        }
    );


    /* =====================================================
       INITIALIZE MEMORY
    ===================================================== */

    loadMemory();


    restoreCurrentChat();


    /* =====================================================
       INITIAL STATE
    ===================================================== */

    hideTypingIndicator();


    setAIStatus(
        "SLIPBOT STANDBY"
    );


    console.log(
        "SlipBot initialization complete."
    );


    console.log(
        "Conversation memory:",
        "ENABLED"
    );

}


/* =========================================================
   SCROLL REVEAL SYSTEM
========================================================= */

function initScrollReveal() {

    console.log(
        "Initializing scroll reveal..."
    );


    /* =====================================================
       HERO
    ===================================================== */

    const hero =
        document.querySelector(
            ".hero"
        );


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
                    document.querySelector(
                        selector
                    );


                if (element) {

                    element.classList.add(
                        "hero-reveal"
                    );

                }

            }
        );


        requestAnimationFrame(
            () => {

                setTimeout(
                    () => {

                        hero.classList.add(
                            "hero-loaded"
                        );

                    },
                    100
                );

            }
        );

    }


    /* =====================================================
       SECTION CONFIGURATION
    ===================================================== */

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


    /* =====================================================
       ADD REVEAL CLASSES
    ===================================================== */

    sections.forEach(
        selector => {

            const section =
                document.querySelector(
                    selector
                );


            if (!section) {
                return;
            }


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


            const targets =
                contentSelectors[
                    selector
                ] || [];


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


    /* =====================================================
       STAGGER GROUPS
    ===================================================== */

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
                document.querySelector(
                    selector
                );


            if (group) {

                group.classList.add(
                    "scroll-stagger"
                );

            }

        }
    );


    /* =====================================================
       LEFT REVEALS
    ===================================================== */

    const leftElements = [

        ".solution-content",

        ".communication-info",

        ".summary-main"

    ];


    leftElements.forEach(
        selector => {

            const element =
                document.querySelector(
                    selector
                );


            if (!element) {
                return;
            }


            element.classList.remove(
                "scroll-reveal"
            );


            element.classList.add(
                "scroll-reveal-left"
            );

        }
    );


    /* =====================================================
       RIGHT REVEALS
    ===================================================== */

    const rightElements = [

        ".solution-visual",

        ".communication-screen"

    ];


    rightElements.forEach(
        selector => {

            const element =
                document.querySelector(
                    selector
                );


            if (!element) {
                return;
            }


            element.classList.remove(
                "scroll-reveal"
            );


            element.classList.add(
                "scroll-reveal-right"
            );

        }
    );


    /* =====================================================
       SCALE REVEALS
    ===================================================== */

    const scaleElements = [

        ".testing-dashboard",

        ".project-final",

        ".hardware-core",

        ".project-video-container"

    ];


    scaleElements.forEach(
        selector => {

            const element =
                document.querySelector(
                    selector
                );


            if (!element) {
                return;
            }


            element.classList.remove(
                "scroll-reveal"
            );


            element.classList.add(
                "scroll-reveal-scale"
            );

        }
    );


    /* =====================================================
       FIND ALL ELEMENTS
    ===================================================== */

    const revealElements =
        document.querySelectorAll(

            ".scroll-reveal, " +

            ".scroll-reveal-left, " +

            ".scroll-reveal-right, " +

            ".scroll-reveal-scale, " +

            ".scroll-stagger, " +

            ".scroll-heading"

        );


    console.log(
        "Reveal elements:",
        revealElements.length
    );


    /* =====================================================
       INTERSECTION OBSERVER
    ===================================================== */

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

                    threshold:
                        0.12,

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


/* =========================================================
   NEURAL SENSOR NETWORK
========================================================= */

function initNeuralNetwork() {

    console.log(
        "Initializing neural sensor network..."
    );


    /* =====================================================
       CANVAS SUPPORT
    ===================================================== */

    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.id =
        "neural-network-bg";


    /* -----------------------------------------------------
       IMPORTANT:
       The canvas must NEVER block clicks.
    ----------------------------------------------------- */

    canvas.style.pointerEvents =
        "none";


    canvas.style.position =
        "fixed";


    canvas.style.top =
        "0";


    canvas.style.left =
        "0";


    canvas.style.width =
        "100%";


    canvas.style.height =
        "100%";


    canvas.style.zIndex =
        "-1";


    document.body.prepend(
        canvas
    );


    const ctx =
        canvas.getContext(
            "2d"
        );


    if (!ctx) {

        console.warn(
            "Canvas is not supported."
        );


        return;

    }


    /* =====================================================
       SETTINGS
    ===================================================== */

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


    let width =
        0;


    let height =
        0;


    let dpr =
        1;


    /* =====================================================
       RESIZE
    ===================================================== */

    function resizeCanvas() {

        dpr =
            Math.min(

                window.devicePixelRatio ||
                    1,

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
        resizeCanvas,
        {
            passive: true
        }
    );


    /* =====================================================
       MOUSE
    ===================================================== */

    const mouse = {

        x:
            null,

        y:
            null

    };


    window.addEventListener(

        "mousemove",

        event => {

            mouse.x =
                event.clientX;


            mouse.y =
                event.clientY;

        },

        {
            passive: true
        }

    );


    window.addEventListener(

        "mouseout",

        event => {

            if (
                event.relatedTarget ===
                    null
            ) {

                mouse.x =
                    null;


                mouse.y =
                    null;

            }

        }

    );


    /* =====================================================
       NODE
    ===================================================== */

    class Node {

        constructor() {

            this.x =
                Math.random() *
                width;


            this.y =
                Math.random() *
                height;


            this.vx =
                (
                    Math.random() -
                    0.5
                )
                *
                settings.nodeSpeed;


            this.vy =
                (
                    Math.random() -
                    0.5
                )
                *
                settings.nodeSpeed;


            this.radius =
                Math.random() *
                1.7 +
                1;


            this.phase =
                Math.random() *
                Math.PI *
                2;

        }


        update() {

            this.x +=
                this.vx;


            this.y +=
                this.vy;


            /* -------------------------------------------------
               WRAP X
            ------------------------------------------------- */

            if (
                this.x < -20
            ) {

                this.x =
                    width + 20;

            }


            if (
                this.x >
                width + 20
            ) {

                this.x =
                    -20;

            }


            /* -------------------------------------------------
               WRAP Y
            ------------------------------------------------- */

            if (
                this.y < -20
            ) {

                this.y =
                    height + 20;

            }


            if (
                this.y >
                height + 20
            ) {

                this.y =
                    -20;

            }


            /* -------------------------------------------------
               MOUSE INFLUENCE
            ------------------------------------------------- */

            if (
                mouse.x !== null &&
                mouse.y !== null
            ) {

                const dx =
                    this.x -
                    mouse.x;


                const dy =
                    this.y -
                    mouse.y;


                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );


                if (
                    distance > 0 &&
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
                        (
                            dx /
                            distance
                        )
                        *
                        force
                        *
                        0.25;


                    this.y +=
                        (
                            dy /
                            distance
                        )
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
                    ) +
                    1
                )
                /
                2;


            const alpha =
                0.35 +
                glow *
                0.35;


            /* -------------------------------------------------
               OUTER GLOW
            ------------------------------------------------- */

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


            /* -------------------------------------------------
               NODE
            ------------------------------------------------- */

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


    /* =====================================================
       CREATE NODES
    ===================================================== */

    const nodes =
        [];


    for (
        let i = 0;
        i <
            settings.nodeCount;
        i++
    ) {

        nodes.push(
            new Node()
        );

    }


    /* =====================================================
       CONNECTIONS
    ===================================================== */

    function drawConnections() {

        for (
            let i = 0;
            i <
                nodes.length;
            i++
        ) {

            for (
                let j = i + 1;
                j <
                    nodes.length;
                j++
            ) {

                const a =
                    nodes[i];


                const b =
                    nodes[j];


                const dx =
                    a.x -
                    b.x;


                const dy =
                    a.y -
                    b.y;


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


    /* =====================================================
       SIGNAL PULSE
    ===================================================== */

    let signalTimer =
        0;


    let signalNode =
        null;


    function drawSignalPulse() {

        if (!signalNode) {
            return;
        }


        signalTimer +=
            0.025;


        const radius =
            signalTimer *
            90;


        const alpha =
            Math.max(

                0,

                0.22 -
                    signalTimer *
                    0.025

            );


        if (
            alpha <= 0
        ) {

            signalNode =
                null;


            signalTimer =
                0;


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


    /* =====================================================
       RANDOM SIGNALS
    ===================================================== */

    setInterval(

        () => {

            if (
                Math.random() <
                0.7
            ) {

                signalNode =
                    nodes[
                        Math.floor(

                            Math.random() *
                            nodes.length

                        )
                    ];


                signalTimer =
                    0;

            }

        },

        3500

    );


    /* =====================================================
       ANIMATION
    ===================================================== */

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


    console.log(
        "Neural sensor network ready."
    );

}

