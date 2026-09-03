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
   SEND MESSAGE WITH STREAMING
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


    /* Create empty bot bubble */

    const botMessage =
        createBotMessage();

    botMessage.textContent =
        "🤖 SlipBot is thinking...";


    try {

        const response =
            await fetch("/api/chat", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: question
                })

            });


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
           STREAM CHECK
        ===================================== */

        if (!response.body) {

            botMessage.textContent =
                "⚠️ Streaming is not supported by this browser.";

            return;

        }


        const reader =
            response.body.getReader();

        const decoder =
            new TextDecoder("utf-8");


        let fullReply = "";

        let firstChunk = true;


        /* =====================================
           READ STREAM
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


            /* Remove thinking message */

            if (firstChunk) {

                botMessage.textContent = "";

                firstChunk = false;

            }


            fullReply += chunk;

            botMessage.textContent =
                fullReply;


            /* Auto-scroll */

            chatMessages.scrollTop =
                chatMessages.scrollHeight;

        }


        /* Finish decoder */

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
            "⚠️ I couldn't reach the SlipBot server. Make sure server.py is running.";

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