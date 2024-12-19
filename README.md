# SIOT
Sensing and IoT coursework
#**SentiSense**
## **Overview**
The Mirror Mood Journal App is a smart journaling application designed to help users track their mood, stress, and energy levels. By analyzing a user's voice, text, and image inputs, the app generates actionable insights about their mental and emotional state over time. The app leverages natural language processing, sentiment analysis, and visual data to provide personalized suggestions for better well-being.

## **Features**
Voice Journaling: Record your thoughts and emotions via voice input. The app analyses  keywords to detect mood trends.
Daily Trends Visualization: Mood and stress levels are displayed as hex color codes on an interactive  grid.
Personalised Suggestions: Recommendations such as taking breaks, walking, or reflecting to help manage stress and emotions.
Integration with Fitbit: Syncs heart rate and physical activity data to enhance stress and tiredness predictions.

## **How to Run**
Prerequisites
Node.js (latest LTS version recommended)
Python 3.9+
NPM (comes with Node.js installation)
Uvicorn (Python ASGI server)
Setup Instructions
Clone the Repository

bash
Copy code
git clone https://github.com/yourusername/mirror-mood-journal.git
cd mirror-mood-journal
Install Dependencies

##Frontend: Navigate to the mirror-mood-journal-main directory and run:
bash
Copy code
npm install
##Backend: Navigate to the backend directory and install Python dependencies:
bash
Copy code
pip install -r requirements.txt

**Add API Keys**
Create a .env file in both the backend and server directories.
Add the following keys to the .env file:
makefile

**Copy code**
ASSEMBLYAI_API_KEY=your_assembly_ai_api_key
OPENAI_API_KEY=your_openai_api_key
FITBIT_API_KEY=your_fitbit_api_key
Start the App

****Open three terminal windows:****
Frontend:
bash
Copy code
cd mirror-mood-journal-main
npm run dev
Backend:
bash
Copy code
cd backend
uvicorn app:app --reload
Server:
bash
Copy code
cd server
node server.js
Access the App

**Open your browser and navigate to http://localhost:3000 to start using the app.**
Additional Notes
API Integrations
AssemblyAI:
Used for voice transcription and sentiment analysis.
Add your API key in the .env file in the backend directory.
OpenAI:
Provides advanced NLP capabilities for analyzing journal entries and generating insights.
Add your API key in the .env file in the server directory.
Fitbit API:
Syncs health data such as heart rate and activity levels to improve stress analysis.
Add your API key in the .env file in the backend directory.
