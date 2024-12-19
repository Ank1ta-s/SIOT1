from fastapi import FastAPI, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import numpy as np
from scipy.io.wavfile import write
import sounddevice as sd
import threading
import assemblyai as aai
from openai import OpenAI
from datetime import datetime, timedelta
import json
import os


# Configuration
ACCESS_TOKEN = ''  # Replace with your Fitbit access token
ASSEMBLYAI_API_KEY = ''  # Replace with your AssemblyAI API key
OPENAI_API_KEY = ''  # Replace with your OpenAI API key

aai.settings.api_key = ASSEMBLYAI_API_KEY
openai_client = OpenAI(api_key)

HEADERS = {'Authorization': f'Bearer {ACCESS_TOKEN}', 'Accept': 'application/json'}
SAMPLERATE = 44100  # Sample rate
FILENAME = "output.wav"  # Output filename

app = FastAPI()

# Middleware for CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global recording state
recording = {"is_recording": False, "data": [], "stream": None, "thread": None}
# Global results state
latest_results = None

# Add this function near the top of the file, after the imports
def get_today_date():
    return datetime.now().strftime('%Y-%m-%d')

# Fetch Fitbit data
def fetch_fitbit_data():
    print("Fetching Fitbit data...")
    results = {}
    today = get_today_date()

    try:
        # Activity data (steps)
        activity_url = f'https://api.fitbit.com/1/user/-/activities/date/{today}.json'
        activity_data = requests.get(activity_url, headers=HEADERS).json()
        results["activity"] = activity_data.get("summary", {})

        # Sleep data
        sleep_url = f'https://api.fitbit.com/1.2/user/-/sleep/date/{today}.json'
        sleep_data = requests.get(sleep_url, headers=HEADERS).json()
        results["sleep"] = sleep_data.get("summary", {}).get("stages", {})

        # Heart rate data
        heart_url = f'https://api.fitbit.com/1/user/-/activities/heart/date/{today}/1d.json'
        heart_data = requests.get(heart_url, headers=HEADERS).json()
        results["heart"] = heart_data.get("activities-heart", [{}])[0].get("value", {})

        return results

    except Exception as e:
        print(f"Error fetching Fitbit data: {e}")
        return results

# Transcribe and process audio
def process_audio():
    print("Processing audio...")
    transcriber = aai.Transcriber()
    config = aai.TranscriptionConfig(
        sentiment_analysis=True,
        summarization=True,
        summary_model=aai.SummarizationModel.informative,
        summary_type=aai.SummarizationType.bullets
    )
    transcript = transcriber.transcribe(FILENAME, config)
    return {
        "transcription": transcript.text,
        "summary": transcript.summary if hasattr(transcript, 'summary') else "No summary available.",
        "sentiment": transcript.sentiment_analysis
    }

# Generate recommendations using OpenAI
def generate_recommendations(transcription, fitbit_data):
    print("Generating recommendations...")
    prompt = f"""
    Based on the following transcription and Fitbit data, suggest three actionable recommendations to improve mental health tomorrow:
    
    Transcription: {transcription}
    Fitbit Data: {fitbit_data}
    
    Format each recommendation exactly like this:
    Recommendation 1:
    [Title]
    [Description]
    
    Recommendation 2:
    [Title]
    [Description]
    
    Recommendation 3:
    [Title]
    [Description]
    """
    try:
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant providing mental health recommendations."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.7
        )
        recommendations = response.choices[0].message.content.strip()
        print("Generated recommendations:", recommendations)
        return recommendations
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        return "Unable to generate recommendations at this time."

# Recording loop
def record_loop():
    global recording
    try:
        while recording["is_recording"]:
            frame, _ = recording["stream"].read(1024)
            recording["data"].append(frame)
    except Exception as e:
        print(f"Error during recording: {e}")
    finally:
        if recording["stream"]:
            recording["stream"].stop()
            recording["stream"].close()
            recording["stream"] = None

# Start recording
@app.post("/start-recording")
def start_recording():
    global recording
    if recording["is_recording"]:
        return {"message": "Already recording"}

    try:
        recording["is_recording"] = True
        recording["data"] = []
        recording["stream"] = sd.InputStream(samplerate=SAMPLERATE, channels=1, dtype='int16')
        recording["stream"].start()

        # Start the recording loop in a separate thread
        recording["thread"] = threading.Thread(target=record_loop)
        recording["thread"].start()

        print("Recording started")
        return {"message": "Recording started"}
    except Exception as e:
        print(f"Error in /start-recording: {e}")
        return {"error": f"Failed to start recording: {str(e)}"}, 500

# Stop recording and process
@app.post("/stop-recording")
def stop_recording(background_tasks: BackgroundTasks):
    global recording, latest_results
    if not recording["is_recording"]:
        return {"message": "Not currently recording"}

    recording["is_recording"] = False

    # Wait for the recording thread to finish
    if recording["thread"]:
        recording["thread"].join()

    try:
        # Save recorded audio
        audio_data = np.concatenate(recording["data"], axis=0)
        write(FILENAME, SAMPLERATE, audio_data)
        print(f"Recording saved to {FILENAME}")

        # Process audio and fetch data
        audio_results = process_audio()
        fitbit_results = fetch_fitbit_data()

        # Generate recommendations immediately after getting data
        recommendations = generate_recommendations(audio_results['transcription'], fitbit_results)

        # Save all results together
        latest_results = {
            "audio_results": audio_results,
            "fitbit_results": fitbit_results,
            "recommendations": recommendations
        }

        print("Processing complete with recommendations:", latest_results)
        return {"message": "Recording stopped and processing complete"}
    except Exception as e:
        print(f"Error during stop-recording: {e}")
        return {"error": f"Failed to stop recording: {str(e)}"}, 500

# Fetch results
@app.get("/results")
def get_results():
    global latest_results
    if latest_results is None:
        return {"message": "No results available yet"}
    return latest_results

# Add a new endpoint for getting recommendations
@app.post("/generate-recommendations")
async def generate_recommendations_endpoint(request: Request):
    try:
        data = await request.json()
        transcription = data.get('transcription')
        fitbit_data = data.get('fitbit_data')
        
        if not transcription or not fitbit_data:
            return {"error": "Missing transcription or Fitbit data"}
            
        recommendations = generate_recommendations(transcription, fitbit_data)
        return {"recommendations": recommendations}
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        return {"error": "Failed to generate recommendations"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
