# PitchSense AI - Real-Time Speech-to-Score Engine

## SDE I Round 2 Assignment - Option A

### Overview

PitchSense AI is a real-time speech analysis tool that captures audio input, transcribes it using Groq's Whisper model via Vercel AI SDK, and provides comprehensive speech metrics including:

- **Words Per Minute (WPM)**: Real-time calculation of speaking speed
- **Filler Words Detection**: Identifies and highlights filler words like "um", "uh", "like", etc.
- **Pause Duration Analysis**: Tracks pauses longer than 0.5 seconds
- **Real-Time Visualizations**: Speed graph and filler word heatmap
- **Full Transcription**: Complete text output of the speech

### Technology Stack

#### Backend

- **GroqAI Whisper**: Speech-to-text via emergentintegrations library
- **Node.js**

#### Frontend

- **React 19**: Modern UI library
- **Chart.js & react-chartjs-2**: Real-time data visualization
- **Web Audio API**: Microphone access and recording
- **Axios**: HTTP client

### Key Features

1. **Real Microphone Input**: Uses browser's MediaRecorder API to capture live audio
2. **Accurate Transcription**: Powered by Whisper-1 model with timestamp granularity
3. **Speech Metrics**:
   - WPM calculation based on word count and duration
   - Detection of 18+ common filler words and phrases
   - Pause detection with duration tracking
4. **Real-Time Visualizations**:
   - Line graph showing WPM trends across recordings
   - Filler word heatmap with timestamps
   - Pause duration bars with visual representation
5. **Clean, Responsive UI**: Modern glassmorphic design with smooth animations
