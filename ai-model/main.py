import cv2
import numpy as np
from ultralytics import YOLO
import time
import requests
import google.generativeai as genai
import PIL.Image
import threading
from queue import Queue
from twilio.rest import Client
import os
import uuid
from io import BytesIO
from dotenv import load_dotenv
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs

from mongo_service import MongoLogService

load_dotenv()
account_sid = os.getenv("TWILIO_SID")
auth_token  = os.getenv("TWILIO_AUTH_TOKEN")


client = Client(account_sid, auth_token)

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
elevenlabs = ElevenLabs(
    api_key=ELEVENLABS_API_KEY,
)

# --- CONFIG ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-2.5-flash')
SUPERPLANE_WEBHOOK_URL = "YOUR_SUPERPLANE_URL"
mongo_service = MongoLogService()
mongo_service.connect()

# YOLO Pose model is better (XGBoost code wala idea)
# 'yolo11n-pose.pt' use karne se body keypoints milte hain
model = YOLO("yolo11n-pose.pt") 

class HackByteVision:
    def __init__(self):
        self.last_analysis_text = "System: Monitoring..."
        self.is_analyzing = False
        self.alert_status = False
        self.analysis_queue = Queue(maxsize=1) # Background task queue
        self.call_made = False # Prevents spamming the Twilio API
        self.voice_alerted = False # Prevents spamming the ElevenLabs API
        self.mongo_logged = False # Prevents duplicate MongoDB inserts per alert session

    def make_twilio_msg(self):
        """Runs in a separate thread to prevent video freezing."""
        try:
            print("Initiating emergency Twilio SMS...")
            messaging_service_sid = os.getenv(
                "TWILIO_MESSAGING_SERVICE_SID",
                "MG82b2484892a032b9623e6f8aa350120f",
            )
            destination_number = os.getenv("TWILIO_ALERT_TO", "+919234887044")
            message = client.messages.create(
                messaging_service_sid=messaging_service_sid,
                body='Alert: suspicious activity detected by Trinetra.',
                to=destination_number,
            )
            print(f"Twilio SMS successful! SID: {message.sid}")
        except Exception as e:
            print(f"Twilio Error: {e}")
    
    def text_to_speech_stream(self, text):
        # Perform the text-to-speech conversion
        response = elevenlabs.text_to_speech.stream(
            voice_id="K24eC7JpUgk8zMtQYrpV", # Adam pre-made voice
            output_format="mp3_22050_32",
            text=text,
            model_id="eleven_multilingual_v2",
            # Optional voice settings that allow you to customize the output
            voice_settings=VoiceSettings(
                stability=0.0,
                similarity_boost=1.0,
                style=0.0,
                use_speaker_boost=True,
                speed=1.0,
            ),
        )
        # Create a BytesIO object to hold the audio data in memory
        audio_stream = BytesIO()
        # Write each chunk of audio data to the stream
        for chunk in response:
            if chunk:
                audio_stream.write(chunk)
        # Reset stream position to the beginning
        audio_stream.seek(0)
        # Return the stream for further use
        return audio_stream

    def make_voice_alert(self, current_pil_img):
        try:
            print("Generating ElevenLabs voice alert...")
            warning_prompt = "A theft was just detected. Write a strict, 1-sentence warning to the person over the intercom. Mention one piece of their clothing based on the image. Do not use hashtags or emojis."
            
            warning_text = gemini_model.generate_content([warning_prompt, current_pil_img]).text
            print(f"AI Warning Text: {warning_text}")

            self.text_to_speech_stream(warning_text) # This will generate the TTS audio but not play it, as we can't do that in this environment
            print("ElevenLabs voice alert generated successfully!")
        
        except Exception as e:
            print(f"ElevenLabs Error: {e}")

    def build_mongo_alert_message(self, analysis_text, person_count):
        try:
            prompt = f"""
            Rewrite this CCTV theft alert into one concise operator log line.

            Rules:
            - Keep it under 160 characters.
            - Mention the alert risk clearly.
            - Mention the person count when useful.
            - Do not add markdown, quotes, or bullet points.

            Analysis:
            {analysis_text}

            People detected: {person_count}
            """

            response = gemini_model.generate_content(prompt)
            custom_message = (response.text or '').strip()
            return custom_message or analysis_text.strip()
        except Exception as e:
            print(f"Mongo log message generation error: {e}")
            return analysis_text.strip()

    def push_alert_log_to_db(self, analysis_text, person_count):
        try:
            custom_message = self.build_mongo_alert_message(analysis_text, person_count)
            payload = {
                "id": str(uuid.uuid4()),
                "timestamp": mongo_service.build_timestamp(),
                "text": custom_message,
                "isAlert": True,
                "riskLevel": "high",
                "personCount": person_count,
                "analysis": analysis_text,
            }
            if mongo_service.push_alert_log(payload):
                print(f"MongoDB alert log saved: {payload['id']}")
        except Exception as e:
            print(f"MongoDB logging error: {e}")

    def ai_worker(self):
        """Ye function alag thread mein chalega taaki video freeze na ho"""
        while True:
            if not self.analysis_queue.empty():
                frame, person_count = self.analysis_queue.get()
                self.is_analyzing = True
                
                try:
                    img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    pil_img = PIL.Image.fromarray(img_rgb)
                    
                    prompt = f"""
                                You are a strict retail theft detection system for CCTV.

                                People detected: {person_count}

                                Your job:
                                1. Detect only clear or highly suspicious theft-related behavior.
                                2. Focus on hand movement, concealment, object pickup without paying, hiding items, repeated looking around, blocking camera view, passing items between people, or worker distraction.
                                3. Do NOT give a normal scene summary.
                                4. Do NOT be polite or vague.
                                5. If there is any strong theft suspicion, output exactly:

                                ALERT: THEFT
                                <one short reason>

                                6. If behavior is suspicious but not enough for theft, output exactly:

                                SUSPICIOUS
                                <one short reason>

                                7. If nothing suspicious is visible, output exactly:

                                CLEAR

                                8. Prefer false positives over false negatives.
                                9. Treat partially hidden hands, pocketing motions, bag concealment, and blocking actions as suspicious.
                                10. Judge only visible behavior in this frame.

                                Analyze now.
                                """
                    
                    response = gemini_model.generate_content([prompt, pil_img])
                    self.last_analysis_text = response.text
                    
                    if "ALERT" in self.last_analysis_text.upper():
                        self.alert_status = True
                        if not self.call_made:
                            threading.Thread(target=self.make_twilio_msg, daemon=True).start()
                            self.call_made = True
                        if not self.mongo_logged:
                            threading.Thread(
                                target=self.push_alert_log_to_db,
                                args=(self.last_analysis_text, person_count),
                                daemon=True,
                            ).start()
                            self.mongo_logged = True
                        if SUPERPLANE_WEBHOOK_URL and SUPERPLANE_WEBHOOK_URL != "YOUR_SUPERPLANE_URL":
                            try:
                                requests.post(
                                    SUPERPLANE_WEBHOOK_URL,
                                    json={"msg": self.last_analysis_text},
                                    timeout=5,
                                )
                            except Exception as webhook_error:
                                print(f"Webhook Error: {webhook_error}")
                        if not self.voice_alerted:
                            threading.Thread(
                                target=self.make_voice_alert,
                                args=(pil_img,),
                                daemon=True,
                            ).start()
                            self.voice_alerted = True
                    else:
                        self.alert_status = False
                        self.call_made = False
                        self.voice_alerted = False 
                        self.mongo_logged = False
                        
                except Exception as e:
                    print(f"AI Error: {e}")
                
                self.is_analyzing = False
            time.sleep(0.1)

    def run(self, video_source):
        # Start the background AI thread
        threading.Thread(target=self.ai_worker, daemon=True).start()
        
        cap = cv2.VideoCapture(video_source)
        last_ai_time = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break
            
            frame = cv2.resize(frame, (960, 540))
            current_time = time.time()
            
            # YOLO Pose Detection
            results = model.track(frame, persist=True, verbose=False)
            
            person_count = 0
            if results[0].boxes.id is not None:
                person_count = len(results[0].boxes.id)
                # Draw Pose Keypoints (Optional: helps during demo)
                frame = results[0].plot() 

            # Trigger Gemini (Non-blocking)
            # Har 5 sec mein ya jab 4+ log ho, frame queue mein daal do
            if not self.is_analyzing and (current_time - last_ai_time > 1 or person_count >= 4):
                if self.analysis_queue.empty():
                    self.analysis_queue.put((frame.copy(), person_count))
                    last_ai_time = current_time

            # UI Overlay
            status_color = (0, 0, 255) if self.alert_status else (0, 255, 0)
            cv2.rectangle(frame, (0, 440), (960, 540), (0, 0, 0), -1) # Bottom Bar
            
            # Show Gemini's last analysis result
            display_text = self.last_analysis_text[:100] + "..." # Truncate for UI
            cv2.putText(frame, display_text, (20, 480), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            cv2.putText(frame, f"LIVE STATUS: {'ALERT' if self.alert_status else 'OK'}", 
                        (20, 520), cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_color, 2)
            cv2.imshow("HackByte 4.0 - Anti-Freeze Vision", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'): break

        cap.release()
        cv2.destroyAllWindows()

# Launch
vision_system = HackByteVision()
vision_system.run("test.mp4")