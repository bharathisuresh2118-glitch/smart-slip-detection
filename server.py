import os
import requests

from flask import (
    Flask,
    request,
    jsonify,
    send_from_directory,
    Response
)

from flask_cors import CORS


# =========================================================
# FLASK APP
# =========================================================

app = Flask(__name__)

CORS(app, resources={
    r"/api/*": {
        "origins": "https://bharathisuresh2118-glitch.github.io"
    }
})


# =========================================================
# GROQ CONFIGURATION
# =========================================================

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

MODEL = "openai/gpt-oss-20b"


# =========================================================
# PROJECT KNOWLEDGE + AI INSTRUCTIONS
# =========================================================

PROJECT_KNOWLEDGE = """
You are SlipBot, the official AI assistant for the Smart Slip Detection System.

==================================================
YOUR THREE SOURCES OF INTELLIGENCE
==================================================

You should use THREE sources:

1. PROJECT KNOWLEDGE
2. CONVERSATION MEMORY
3. GENERAL AI KNOWLEDGE AND REASONING


==================================================
1. PROJECT KNOWLEDGE
==================================================

The PROJECT KNOWLEDGE below is the authoritative source for facts about
our specific Smart Slip Detection System prototype.

Your general knowledge and reasoning should be used to:

- Explain scientific concepts.
- Explain technical concepts.
- Simplify difficult ideas.
- Connect different parts of the project.
- Answer reasonable follow-up questions.
- Help prepare answers for science-expo judges.
- Explain WHY something is used.
- Explain HOW something works.
- Answer general questions that are outside the project.


IMPORTANT:

Your general knowledge must NOT be used to invent facts about our
specific prototype.

If a specific project detail is not documented below, say that the
detail is not documented or cannot be confirmed.

Do not invent:

- Component prices
- Testing results
- Exact performance percentages
- Final pin assignments that are marked as unconfirmed
- Hardware that is not listed
- Software features that are not documented
- Certifications
- Medical claims
- Features described only as future improvements


==================================================
2. CONVERSATION MEMORY
==================================================

Previous conversation messages may be supplied with the user's request.

Use conversation memory to understand references such as:

- "it"
- "that"
- "this"
- "the previous answer"
- "what did you say earlier?"
- "explain that again"
- "make that shorter"
- "what about the other sensor?"

Conversation memory is conversational context.

It is NOT authoritative project documentation.

If conversation memory conflicts with PROJECT KNOWLEDGE:

PROJECT KNOWLEDGE ALWAYS WINS for project-specific facts.


Example:

If previous conversation says:
"The PIR is the main fall detector."

but PROJECT KNOWLEDGE says:
"The MPU6050 is the primary motion sensor."

You must use the PROJECT KNOWLEDGE and correct the misunderstanding.


Do not claim that something was implemented merely because it appeared
in an earlier conversation.


==================================================
3. GENERAL AI KNOWLEDGE
==================================================

Use your normal AI knowledge and reasoning for questions outside the
project.

For example:

"What is acceleration?"

"How does an accelerometer work?"

"What is IoT?"

"What is the difference between a gyroscope and accelerometer?"

These should receive normal scientifically accurate explanations.


==================================================
PRIORITY RULE
==================================================

For project-specific information:

PROJECT KNOWLEDGE
        >
CONVERSATION MEMORY
        >
GENERAL ASSUMPTIONS


For general questions:

GENERAL AI KNOWLEDGE AND REASONING may be used normally.


==================================================
RESPONSE STYLE
==================================================

- Answer directly.
- Be concise.
- For normal questions, usually use 1-4 sentences.
- For simple questions, use 1-2 sentences.
- For judge questions, give the direct answer first.
- Explain further only when useful.
- Use Class 9-friendly language unless deeper technical detail is requested.
- Do not repeat the user's question.
- Avoid unnecessary introductions.
- Do not make every answer sound identical.
- Use your reasoning ability to produce natural answers.
- If the user asks for detailed explanation, provide more detail.
- If the user asks for a short answer, keep it short.


==================================================
PROJECT IDENTITY
==================================================

Project Name:
Slip Detection System

Project Type:
Embedded System / IoT / Senior-Citizen Safety Prototype

Primary Controller:
Arduino UNO R3

Primary Purpose:
The system is designed to detect a possible unexpected slip or fall using
motion and supporting sensors, activate local audible alerts, and notify
a designated person through GSM communication.

Core concept:

Detect -> Confirm/Monitor -> Alert -> Notify -> Acknowledge -> Reset


==================================================
CURRENT HARDWARE
==================================================

The project uses:

1. Arduino UNO R3
2. MPU6050 accelerometer + gyroscope
3. PIR motion sensor
4. Ultrasonic distance sensor
5. I2C LCD display
6. Main/neighbour-house buzzer
7. Micro-buzzer
8. Push button
9. SIM900A GSM module


==================================================
ROLE OF EACH COMPONENT
==================================================

Arduino UNO:
Acts as the central controller. It reads sensors, processes detection logic,
controls the LCD and buzzers, handles the push button, and communicates with
the GSM module.

MPU6050:
Primary motion sensor. Contains a 3-axis accelerometer and 3-axis gyroscope.
It measures acceleration and rotation/movement.

PIR sensor:
Detects human movement/presence. It is supporting/contextual information and
should NOT be described as the primary fall detector.

Ultrasonic sensor:
Measures distance to nearby objects/persons. It can provide additional
environmental/proximity information.

LCD:
Displays system status, monitoring information, alerts, SMS status, and reset
information.

Main/neighbour-house buzzer:
Intended to provide an audible alert that can notify someone nearby, such as
a neighbour.

Micro-buzzer:
Provides a local audible warning near the monitored person.

Push button:
Used to acknowledge/cancel an active alert and return the system to monitoring.

SIM900A:
Provides cellular communication and can send an emergency SMS to a predefined
contact when an alert is triggered.


==================================================
MPU6050
==================================================

The MPU6050 provides acceleration on X, Y, and Z axes and gyroscope measurements.

Acceleration magnitude can be calculated conceptually as:

A = sqrt(Ax^2 + Ay^2 + Az^2)

Earth's gravitational acceleration is approximately 9.81 m/s^2.

The system should NOT assume that every acceleration greater than 9.81 m/s^2
automatically means a fall.

The CURRENT prototype primarily uses acceleration-based detection.

A more advanced version may use:

Normal movement
-> possible free-fall/reduction
-> impact
-> orientation
-> confirmation

Do NOT claim that the advanced free-fall/orientation algorithm is already
fully implemented unless the user explicitly says it has been implemented.


==================================================
DETECTION PRIORITY
==================================================

The MPU6050 has priority for immediate abnormal-motion detection.

The buzzer response should occur immediately after the relevant MPU detection
condition is met.

PIR and ultrasonic sensors can provide supporting/contextual information and
should not introduce unnecessary delays before the immediate local alert.


==================================================
ALERT BEHAVIOR
==================================================

When a possible fall is detected:

1. Activate the neighbour-house/main buzzer.
2. Activate the micro-buzzer.
3. Display an alert on the LCD.
4. Send an emergency SMS through the SIM900A.
5. Keep the audible alert active.
6. Wait for the acknowledgement/reset button.

The alert should be sent once per detected event rather than repeatedly on
every program loop.


==================================================
RESET BEHAVIOR
==================================================

The push button is configured using INPUT_PULLUP.

Therefore:

Button released -> HIGH
Button pressed -> LOW

When the button is pressed during an active alert:

Both buzzers -> OFF
Alert -> Cleared
System -> Reset
Monitoring -> Resumes


==================================================
LCD STATES
==================================================

Possible normal state:

SYSTEM SAFE
MONITORING...

Possible alert:

!! FALL ALERT !!
PRESS BUTTON

Possible GSM state:

FALL DETECTED!
SENDING SMS...

Possible reset:

ALERT CLEARED
SYSTEM RESET


==================================================
I2C
==================================================

Arduino UNO I2C pins:

A4 -> SDA
A5 -> SCL

Current known I2C addresses:

LCD -> 0x27
MPU6050 -> 0x68

The LCD and MPU6050 can share SDA and SCL because I2C allows multiple devices
with different addresses on the same bus.


==================================================
KNOWN PIN CONFIGURATION
==================================================

Current/known project wiring includes:

PIR OUT -> D2
Push Button -> D7
Main Buzzer -> D8
Micro Buzzer -> D9
SIM900A TX -> D10
SIM900A RX -> D11

LCD SDA -> A4
MPU6050 SDA -> A4

LCD SCL -> A5
MPU6050 SCL -> A5

All relevant devices should use appropriate common ground.

IMPORTANT:
The ultrasonic sensor pin assignment has been discussed as a proposed configuration.
Do not present D4/D5 as definitely final unless the user confirms it.

Earlier project versions also used other ultrasonic pin assignments, so treat the
ultrasonic pins as requiring confirmation if asked.


==================================================
SIM900A
==================================================

The SIM900A communicates with the Arduino using serial communication.

A possible SoftwareSerial configuration is:

SoftwareSerial sim900(10, 11);

Typical AT-command concepts include:

AT
ATE0
AT+CMGF=1
AT+CMGS

The SIM900A requires an appropriate power supply capable of handling its current
requirements.

Do not claim that the Arduino 5V pin is automatically sufficient for every
SIM900A board.

GSM operation also depends on SIM configuration, network availability, antenna,
and module setup.


==================================================
SYSTEM STATES
==================================================

The conceptual system flow is:

SAFE
|
v
Possible abnormal event
|
v
FALL ALERT
|
v
Buzzers ON
|
v
LCD ALERT
|
v
SMS
|
v
WAIT FOR BUTTON
|
v
Button pressed
|
v
Buzzers OFF
|
v
SYSTEM RESET
|
v
SAFE


==================================================
FALSE ALARMS
==================================================

A single acceleration threshold can produce false positives.

Examples include:

- Sitting down quickly
- Device being shaken
- Sudden ordinary movements

A more advanced algorithm could combine:

- Free-fall detection
- Impact detection
- Orientation change
- PIR information
- Ultrasonic information
- Confirmation timing

This can reduce false alarms.

Do not claim perfect fall detection.


==================================================
CURRENT VS ADVANCED VERSION
==================================================

CURRENT PROTOTYPE:

- Arduino UNO
- MPU6050
- PIR
- Ultrasonic sensor
- LCD
- Two buzzers
- Push button
- SIM900A
- Acceleration-based detection
- Manual alert reset

ADVANCED/FUTURE VERSION:

- Free-fall detection
- More sophisticated impact detection
- Orientation analysis
- Multi-sensor confirmation
- Improved false-alarm reduction

Clearly distinguish these two when answering questions.


==================================================
PROJECT LIMITATIONS
==================================================

This is a prototype/research/school science-expo project.

It is NOT a certified medical device and must not be described as guaranteeing
emergency detection or emergency response.

Important limitations include:

- Sensor thresholds require testing and calibration.
- Single-threshold detection can produce false positives.
- GSM communication depends on network availability and module configuration.
- SIM900A needs an appropriate power supply.
- Buzzer current requirements must be checked.
- Suitable transistor/MOSFET drivers may be required for higher-current loads.
- The system should not be treated as the only safety mechanism for a vulnerable
  person.


==================================================
HOW TO ANSWER EXPO JUDGES
==================================================

When answering a science-expo judge:

- Be clear.
- Be technically accurate.
- Use Class 9-friendly language unless a deeper explanation is requested.
- Explain WHY a component is used, not merely what it is.
- Keep answers concise unless the question asks for detail.
- Do not invent features.
- Do not claim the prototype is medically certified.
- Clearly distinguish current implementation from future improvements.

If asked "Why MPU6050?":
Explain that it combines an accelerometer and gyroscope and provides motion,
acceleration, and rotation information useful for detecting abnormal movement.

If asked "Why PIR?":
Explain that PIR provides supporting information about human movement/presence
rather than being the primary fall detector.

If asked "Why ultrasonic?":
Explain that it provides distance/proximity information that can provide
additional context around the monitored person/environment.

If asked "Why two buzzers?":
Explain that one is intended to alert someone nearby/neighbouring while the
other provides a local warning.

If asked "What happens after a fall?":
Explain:
Detection -> immediate buzzers -> LCD alert -> GSM SMS -> wait for button ->
reset and resume monitoring.

If asked "Can it detect every fall?":
Answer honestly:
No. It is a prototype and cannot guarantee detection of every possible fall.
Thresholds and algorithms need further testing and improvement.

If asked "How can you improve it?":
Mention multi-stage detection using free-fall, impact, orientation, PIR,
ultrasonic context, and confirmation logic.

If asked "Is it a medical device?":
Answer:
No. It is a prototype developed for educational/research purposes and is not
a certified medical or emergency device.


==================================================
GENERAL AI BEHAVIOR
==================================================

For questions that are NOT specifically about the project, use your normal
general knowledge and reasoning.

Examples:

"What is IoT?"
-> Give a normal explanation.

"What is acceleration?"
-> Give a normal scientific explanation.

"Why does an accelerometer measure movement?"
-> Explain using general physics knowledge.

"What is the difference between an accelerometer and gyroscope?"
-> Explain using general technical knowledge.

For questions that ARE about the project:

Use the documented project facts first.

Then use general knowledge to explain or connect those facts.

Example:

Question:
"Why is MPU6050 better than using only a basic accelerometer?"

Answer using both:
- Explain the documented reason that MPU6050 provides acceleration and rotation.
- Use general knowledge to explain why gyroscope information can provide
  additional motion/orientation information.

Do NOT turn a possible future feature into a current feature.


==================================================
UNKNOWN PROJECT INFORMATION
==================================================

If the user asks:

"What is the exact cost?"

and no cost is documented:

Say that the exact project cost has not been documented yet.

Do NOT invent a number.

The same rule applies to:

- Exact testing results
- Accuracy percentage
- Battery life
- Final sensor thresholds
- Exact GSM response time
- Exact ultrasonic pin assignment
- Number of successful tests
- Any other undocumented project-specific measurement.


==================================================
ANTI-HALLUCINATION RULE
==================================================

NEVER invent:

- Sensors not listed above
- Hardware not listed above
- Confirmed pin assignments that are marked as proposed
- Detection algorithms described only as future improvements
- Medical certifications
- Guaranteed emergency response
- Testing results that were not provided
- GSM behavior that has not been confirmed
- Project costs that were not provided
- Performance percentages that were not provided

If information is uncertain, say so.

If the user asks about something outside the project, answer normally using
general knowledge.

You are SlipBot, the project's technical assistant.
"""


# =========================================================
# WEBSITE ROUTES
# =========================================================

@app.route("/")
def home():
    return send_from_directory(".", "index.html")


@app.route("/<path:path>")
def serve_file(path):
    return send_from_directory(".", path)


# =========================================================
# AI CHAT
# =========================================================

@app.route("/api/chat", methods=["POST"])
def chat():

    try:

        # -------------------------------------------------
        # READ REQUEST
        # -------------------------------------------------

        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "error": "Invalid JSON request."
            }), 400


        # -------------------------------------------------
        # CURRENT USER MESSAGE
        # -------------------------------------------------

        user_message = data.get(
            "message",
            ""
        ).strip()

        if not user_message:
            return jsonify({
                "error": "Message cannot be empty."
            }), 400


        # -------------------------------------------------
        # CONVERSATION MEMORY
        # -------------------------------------------------

        history = data.get(
            "history",
            []
        )

        # Safety check.
        if not isinstance(history, list):
            history = []


        # Only use the most recent 20 messages.
        #
        # This gives SlipBot useful memory without making the
        # Groq request unnecessarily huge.
        history = history[-20:]


        # -------------------------------------------------
        # API KEY
        # -------------------------------------------------

        api_key = os.environ.get(
            "GROQ_API_KEY"
        )

        if not api_key:

            print(
                "ERROR: GROQ_API_KEY is not configured."
            )

            return jsonify({
                "error":
                "SlipBot is not configured correctly on the server."
            }), 500


        # -------------------------------------------------
        # BUILD MESSAGE ARRAY
        # -------------------------------------------------

        messages = [

            {
                "role": "system",
                "content": PROJECT_KNOWLEDGE
            },

            {
                "role": "system",
                "content": """
The following messages are conversation memory from the current SlipBot
conversation.

Use them as context for understanding the user's current request.

IMPORTANT:

Conversation memory is NOT authoritative project documentation.

If memory conflicts with the project knowledge provided above,
the project knowledge wins.

Do not invent project facts based on memory.

CONVERSATION MEMORY:
"""
            }
        ]


        # -------------------------------------------------
        # ADD MEMORY
        # -------------------------------------------------

        for item in history:

            # Ignore malformed memory entries.
            if not isinstance(item, dict):
                continue


            role = item.get(
                "role"
            )

            content = item.get(
                "content"
            )


            # Only accept normal conversation roles.
            if role not in (
                "user",
                "assistant"
            ):
                continue


            if not isinstance(
                content,
                str
            ):
                continue


            content = content.strip()

            if not content:
                continue


            # Prevent a single stored message from becoming huge.
            content = content[:4000]


            messages.append({

                "role": role,

                "content": content

            })


        # -------------------------------------------------
        # ADD CURRENT USER MESSAGE
        # -------------------------------------------------

        messages.append({

            "role": "user",

            "content": user_message

        })


        # -------------------------------------------------
        # DEBUG LOG
        # -------------------------------------------------

        print()
        print("====================================")
        print("SlipBot request received")
        print("User:", user_message)
        print("Memory messages:", len(history))
        print("Model:", MODEL)
        print("====================================")


        # -------------------------------------------------
        # GROQ REQUEST
        # -------------------------------------------------

        ai_response = requests.post(

            GROQ_URL,

            headers={

                "Authorization":
                f"Bearer {api_key}",

                "Content-Type":
                "application/json"

            },

            json={

                "model":
                MODEL,

                "messages":
                messages,

                "stream":
                False,

                "temperature":
                0.3,

                "max_tokens":
                300

            },

            timeout=30

        )


        # -------------------------------------------------
        # LOG STATUS
        # -------------------------------------------------

        print(
            "Groq status:",
            ai_response.status_code
        )


        # -------------------------------------------------
        # HANDLE GROQ ERROR
        # -------------------------------------------------

        if not ai_response.ok:

            print(
                "Groq error:"
            )

            print(
                ai_response.text
            )


            try:

                error_data = (
                    ai_response.json()
                )

                groq_error = (
                    error_data.get(
                        "error",
                        {}
                    )
                )

                error_message = (
                    groq_error.get(
                        "message",
                        "Unknown Groq error."
                    )
                )

            except Exception:

                error_message = (
                    ai_response.text[:500]
                )


            return jsonify({

                "error":
                "The AI service rejected the request.",

                "details":
                error_message,

                "status":
                ai_response.status_code

            }), 502


        # -------------------------------------------------
        # PARSE GROQ JSON
        # -------------------------------------------------

        try:

            result = ai_response.json()

        except ValueError:

            print(
                "ERROR: Groq returned invalid JSON."
            )

            print(
                ai_response.text[:1000]
            )

            return jsonify({

                "error":
                "The AI service returned an invalid response."

            }), 502


        # -------------------------------------------------
        # GET CHOICES
        # -------------------------------------------------

        choices = result.get(
            "choices",
            []
        )

        if not choices:

            print(
                "ERROR: Groq returned no choices."
            )

            print(
                result
            )

            return jsonify({

                "error":
                "The AI service returned no answer."

            }), 502


        # -------------------------------------------------
        # GET AI MESSAGE
        # -------------------------------------------------

        ai_message = choices[0].get(
            "message",
            {}
        )


        # -------------------------------------------------
        # GET ANSWER
        # -------------------------------------------------

        answer = ai_message.get(
            "content",
            ""
        )


        if not answer:

            print(
                "ERROR: Groq returned empty content."
            )

            print(
                result
            )

            return jsonify({

                "error":
                "The AI service returned an empty answer."

            }), 502


        # -------------------------------------------------
        # SUCCESS
        # -------------------------------------------------

        print(
            "SlipBot answer received successfully."
        )

        print(
            "Answer length:",
            len(answer)
        )

        print(
            "===================================="
        )


        # -------------------------------------------------
        # RETURN ANSWER
        # -------------------------------------------------

        return Response(

            answer,

            content_type=
            "text/plain; charset=utf-8",

            headers={
                "Cache-Control":
                "no-cache"
            }

        )


    # =====================================================
    # CONNECTION ERROR
    # =====================================================

    except requests.exceptions.ConnectionError as e:

        print(
            "ERROR: Could not connect to Groq."
        )

        print(
            str(e)
        )

        return jsonify({

            "error":
            "SlipBot could not connect to the AI service."

        }), 503


    # =====================================================
    # TIMEOUT
    # =====================================================

    except requests.exceptions.Timeout as e:

        print(
            "ERROR: Groq request timed out."
        )

        print(
            str(e)
        )

        return jsonify({

            "error":
            "SlipBot took too long to respond. Please try again."

        }), 504


    # =====================================================
    # UNEXPECTED ERROR
    # =====================================================

    except Exception as e:

        print(
            "UNEXPECTED SERVER ERROR:"
        )

        print(
            repr(e)
        )

        return jsonify({

            "error":
            "An unexpected SlipBot server error occurred."

        }), 500


# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":

    port = int(
        os.environ.get(
            "PORT",
            8000
        )
    )


    print("====================================")
    print("        SLIPBOT AI SERVER")
    print("====================================")
    print("Server starting...")
    print("AI: Groq")
    print("Model:", MODEL)
    print("Mode: NON-STREAMING")
    print("Knowledge Base: LOADED")
    print("General AI: ENABLED")
    print("Conversation Memory: ENABLED")
    print("Memory Window: 20 messages")
    print("CORS: ENABLED")
    print("UTF-8: ENABLED")
    print("Timeout: 30 seconds")
    print("Max output: 300 tokens")
    print("====================================")


    app.run(

        host="0.0.0.0",

        port=port,

        debug=False,

        threaded=True

    )