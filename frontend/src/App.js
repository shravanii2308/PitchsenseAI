import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import RecordingControls from "./components/RecordingControls";
import MetricsDisplay from "./components/MetricsDisplay";
import WPMChart from "./components/WPMChart";
import FillerWordsHeatmap from "./components/FillerWordsHeatmap";
import PausesTimeline from "./components/PausesTimeline";
import TranscriptionDisplay from "./components/TranscriptionDisplay";
import Instructions from "./components/Instructions";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [wpmHistory, setWpmHistory] = useState([]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError("Failed to access microphone. Please grant permission.");
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const analyzeAudio = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      const response = await axios.post(`${API}/transcribe`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setTranscription(response.data.text);
      setAnalysis(response.data);

      setWpmHistory((prev) => [
        ...prev,
        {
          time: prev.length,
          wpm: response.data.wpm,
        },
      ]);
    } catch (err) {
      setError("Failed to analyze audio. Please try again.");
      console.error("Error analyzing audio:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setAudioBlob(null);
    setTranscription("");
    setAnalysis(null);
    setError(null);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <header className="header">
          <div className="logo-section">
            <div className="logo-icon">🎤</div>
            <h1 className="title">PitchSense AI</h1>
          </div>
          <p className="subtitle">Real-Time Speech-to-Score Engine</p>
        </header>

        <div className="main-content">
          <RecordingControls
            isRecording={isRecording}
            audioBlob={audioBlob}
            isProcessing={isProcessing}
            error={error}
            recordingTime={recordingTime}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onAnalyze={analyzeAudio}
            onReset={reset}
            formatTime={formatTime}
          />

          {analysis && (
            <>
              <MetricsDisplay analysis={analysis} />
              <WPMChart wpmHistory={wpmHistory} />
              <FillerWordsHeatmap fillerWords={analysis.filler_words} />
              <PausesTimeline pauses={analysis.pauses} />
              <TranscriptionDisplay transcription={transcription} />
            </>
          )}

          {!analysis && !isRecording && !audioBlob && <Instructions />}
        </div>
      </div>
    </div>
  );
}

export default App;
