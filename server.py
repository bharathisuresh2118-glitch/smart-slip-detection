from flask import Flask, request, jsonify, send_from_directory, Response, stream_with_context
from flask_cors import CORS

app = Flask(__name__)
app = Flask(__name__)

CORS(app, resources={
    r"/api/*": {
        "origins": "https://bharathisuresh2118-glitch.github.io"
    }
})

OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
MODEL = "gemma3:4b"


PROJECT_KNOWLEDGE = """
You are SlipBot, the official AI assistant for the Smart Slip Detection System.

You are NOT a generic chatbot. Your primary purpose is to answer questions about this
specific school science-expo project accurately and clearly.

RESPONSE STYLE:
- Answer directly and concisely.
- For normal questions, use 1-4 sentences.
- For simple questions, use 1-2 sentences.
- Avoid unnecessary introductions and conclusions.
- Do not repeat the user's question.
- For science-expo judge questions, give a short answer first, then explain only if useful.

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
The system is designed to detect a possible unexpected slip or fall using motion and
supporting sensors, activate local audible alerts, and notify a designated person
through GSM communication.

Core concept:

Detect → Confirm/Monitor → Alert → Notify → Acknowledge → Reset


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

A = sqrt(Ax² + Ay² + Az²)

Earth's gravitational acceleration is approximately 9.81 m/s².

The system should NOT assume that every acceleration greater than 9.81 m/s²
automatically means a fall.

The CURRENT prototype primarily uses acceleration-based detection.

A more advanced version may use:

Normal movement
→ possible free-fall/reduction
→ impact
→ orientation change
→ confirmation

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

Button released → HIGH
Button pressed → LOW

When the button is pressed during an active alert:

Both buzzers → OFF
Alert → Cleared
System → Reset
Monitoring → Resumes


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

A4 → SDA
A5 → SCL

Current known I2C addresses:

LCD → 0x27
MPU6050 → 0x68

The LCD and MPU6050 can share SDA and SCL because I2C allows multiple devices
with different addresses on the same bus.


==================================================
KNOWN PIN CONFIGURATION
==================================================

Current/known project wiring includes:

PIR OUT → D2
Push Button → D7
Main Buzzer → D8
Micro Buzzer → D9
SIM900A TX → D10
SIM900A RX → D11

LCD SDA → A4
MPU6050 SDA → A4

LCD SCL → A5
MPU6050 SCL → A5

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
requirements. Do not claim that the Arduino 5V pin is automatically sufficient
for every SIM900A board.

GSM operation also depends on SIM configuration, network availability, antenna,
and module setup.


==================================================
SYSTEM STATES
==================================================

The conceptual system flow is:

SAFE
↓
Possible abnormal event
↓
FALL ALERT
↓
Buzzers ON
↓
LCD ALERT
↓
SMS
↓
WAIT FOR BUTTON
↓
Button pressed
↓
Buzzers OFF
↓
SYSTEM RESET
↓
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
Detection → immediate buzzers → LCD alert → GSM SMS → wait for button →
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
IMPORTANT ANTI-HALLUCINATION RULE
==================================================

NEVER invent:

- Sensors not listed above
- Hardware not listed above
- Confirmed pin assignments that are marked as proposed
- Detection algorithms that are described only as future improvements
- Medical certifications
- Guaranteed emergency response
- Testing results that were not provided
- GSM behavior that has not been confirmed

If information is uncertain, say so.

If the user asks about something outside the project, answer normally but make
it clear that it is outside the project's documented specifications.

You are SlipBot, the project's technical assistant.
"""

import os
import json
import requests

from flask import Flask, request, jsonify, send_from_directory, Response, stream_with_context

app = Flask(__name__)

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.1-8b-instant"


# =========================================================
# WEBSITE
# =========================================================

@app.route("/")
def home():
    return send_from_directory(".", "index.html")


@app.route("/<path:path>")
def files(path):
    return send_from_directory(".", path)


# =========================================================
# STREAMING AI
# =========================================================

@app.route("/api/chat", methods=["POST"])
def chat():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No JSON data received"
            }), 400

        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({
                "error": "Empty message"
            }), 400

        api_key = os.environ.get("GROQ_API_KEY")

        if not api_key:
            return jsonify({
                "error": "GROQ_API_KEY is not configured on the server."
            }), 500

        print()
        print("User:", user_message)
        print("Sending streaming request to AI...")


        ai_response = requests.post(

            GROQ_URL,

            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },

            json={

                "model": MODEL,

                "messages": [

                    {
                        "role": "system",
                        "content": PROJECT_KNOWLEDGE
                    },

                    {
                        "role": "user",
                        "content": user_message
                    }

                ],

                "stream": True,

                "temperature": 0.3,

                "max_tokens": 150

            },

            stream=True,

            timeout=120

        )


        print("AI status:", ai_response.status_code)

        ai_response.raise_for_status()


        @stream_with_context
        def generate():

            try:

                for line in ai_response.iter_lines():

                    if not line:
                        continue


                    if line.startswith(b"data: "):

                        line = line[6:]


                    if line == b"[DONE]":
                        break


                    try:

                        data = json.loads(line)

                        choices = data.get("choices", [])

                        if choices:

                            delta = choices[0].get(
                                "delta",
                                {}
                            )

                            content = delta.get(
                                "content",
                                ""
                            )

                            if content:
                                yield content


                    except json.JSONDecodeError:

                        continue


                print()
                print("SlipBot finished streaming.")


            except Exception as e:

                print(
                    "Streaming error:",
                    str(e)
                )

                yield (
                    "\n\n⚠️ SlipBot encountered an error."
                )


        return Response(

            generate(),

            content_type="text/plain; charset=utf-8"

        )


    except requests.exceptions.ConnectionError:

        print(
            "ERROR: Could not connect to AI service."
        )

        return jsonify({

            "error":
            "SlipBot could not connect to the AI service."

        }), 503


    except requests.exceptions.Timeout:

        print(
            "ERROR: AI service timed out."
        )

        return jsonify({

            "error":
            "The AI service took too long to respond."

        }), 504


    except requests.exceptions.HTTPError as e:
        print("AI HTTP error:", str(e))
        if 'ai_response' in locals():
            print("Groq response:", ai_response.text)

        return jsonify({
            "error": "The AI service rejected the request.",
            "details": ai_response.text if 'ai_response' in locals() else str(e)
        }), 502

    except Exception as e:
        print("ERROR:", str(e))

        return jsonify({
            "error": "An unexpected server error occurred."
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
    print(" Server starting...")
    print(" AI: Groq")
    print(" Model:", MODEL)
    print(" Mode: STREAMING")
    print(" Knowledge Base: LOADED")
    print("====================================")

    app.run(

        host="0.0.0.0",

        port=port,

        debug=False,

        threaded=True

    )