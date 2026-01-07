import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { Line } from "react-chartjs-2";
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

  const wpmChartData = {
    labels: wpmHistory.map((item) => `Recording ${item.time + 1}`),
    datasets: [
      {
        label: "Words Per Minute",
        data: wpmHistory.map((item) => item.wpm),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "#e5e7eb",
          font: {
            size: 14,
            family: "Inter, system-ui, sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        titleColor: "#e5e7eb",
        bodyColor: "#e5e7eb",
        borderColor: "rgba(59, 130, 246, 0.3)",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          color: "#9ca3af",
          font: {
            size: 12,
          },
        },
      },
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          color: "#9ca3af",
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <header className="header">
          <div className="logo-section">
            <div className="logo-icon">🎤</div>
            <h1 className="title">Pitchsense AI</h1>
          </div>
          <p className="subtitle">Real-Time Speech-to-Score Engine</p>
        </header>

        <div className="main-content">
          <div className="card control-card">
            <h2 className="card-title">Recording Control</h2>

            <div className="recording-status">
              {isRecording && (
                <div className="status-indicator">
                  <span className="recording-dot"></span>
                  <span className="recording-text">
                    Recording: {formatTime(recordingTime)}
                  </span>
                </div>
              )}
            </div>

            <div className="button-group">
              {!isRecording && !audioBlob && (
                <button
                  onClick={startRecording}
                  className="btn btn-primary"
                  data-testid="start-recording-button"
                >
                  <span className="btn-icon">🎙️</span>
                  Start Recording
                </button>
              )}

              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="btn btn-danger"
                  data-testid="stop-recording-button"
                >
                  <span className="btn-icon">⏹️</span>
                  Stop Recording
                </button>
              )}

              {audioBlob && !isProcessing && (
                <>
                  <button
                    onClick={analyzeAudio}
                    className="btn btn-success"
                    data-testid="analyze-button"
                  >
                    <span className="btn-icon">📊</span>
                    Analyze Speech
                  </button>
                  <button
                    onClick={reset}
                    className="btn btn-secondary"
                    data-testid="reset-button"
                  >
                    <span className="btn-icon">🔄</span>
                    New Recording
                  </button>
                </>
              )}

              {isProcessing && (
                <div
                  className="processing-indicator"
                  data-testid="processing-indicator"
                >
                  <div className="spinner"></div>
                  <span>Analyzing speech...</span>
                </div>
              )}
            </div>

            {error && (
              <div className="error-message" data-testid="error-message">
                ⚠️ {error}
              </div>
            )}
          </div>

          {analysis && (
            <>
              <div className="metrics-grid">
                <div className="metric-card" data-testid="wpm-metric">
                  <div className="metric-icon">⚡</div>
                  <div className="metric-content">
                    <div className="metric-label">Words Per Minute</div>
                    <div className="metric-value">{analysis.wpm}</div>
                  </div>
                </div>

                <div className="metric-card" data-testid="word-count-metric">
                  <div className="metric-icon">📝</div>
                  <div className="metric-content">
                    <div className="metric-label">Total Words</div>
                    <div className="metric-value">{analysis.word_count}</div>
                  </div>
                </div>

                <div className="metric-card" data-testid="filler-words-metric">
                  <div className="metric-icon">🚫</div>
                  <div className="metric-content">
                    <div className="metric-label">Filler Words</div>
                    <div className="metric-value">
                      {analysis.filler_words?.length || 0}
                    </div>
                  </div>
                </div>

                <div className="metric-card" data-testid="pauses-metric">
                  <div className="metric-icon">⏸️</div>
                  <div className="metric-content">
                    <div className="metric-label">Pauses Detected</div>
                    <div className="metric-value">
                      {analysis.pauses?.length || 0}
                    </div>
                  </div>
                </div>
              </div>

              {wpmHistory.length > 0 && (
                <div className="card chart-card" data-testid="wpm-chart">
                  <h2 className="card-title">Real-Time Speed Graph</h2>
                  <div className="chart-container">
                    <Line data={wpmChartData} options={chartOptions} />
                  </div>
                </div>
              )}

              {analysis.filler_words && analysis.filler_words.length > 0 && (
                <div className="card" data-testid="filler-words-heatmap">
                  <h2 className="card-title">Filler Word Heatmap</h2>
                  <div className="heatmap-container">
                    {analysis.filler_words.map((filler, index) => (
                      <div key={index} className="heatmap-item">
                        <span className="heatmap-word">"{filler.word}"</span>
                        <span className="heatmap-time">
                          at {filler.timestamp.toFixed(1)}s
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.pauses && analysis.pauses.length > 0 && (
                <div className="card" data-testid="pauses-timeline">
                  <h2 className="card-title">Pause Duration Analysis</h2>
                  <div className="pauses-container">
                    {analysis.pauses.map((pause, index) => (
                      <div key={index} className="pause-item">
                        <div
                          className="pause-bar"
                          style={{
                            width: `${Math.min(pause.duration * 50, 300)}px`,
                          }}
                        >
                          <span className="pause-duration">
                            {pause.duration.toFixed(2)}s
                          </span>
                        </div>
                        <span className="pause-timestamp">
                          at {pause.start.toFixed(1)}s
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div
                className="card transcription-card"
                data-testid="transcription-text"
              >
                <h2 className="card-title">Transcription</h2>
                <div className="transcription-content">
                  {transcription || "No transcription available"}
                </div>
              </div>
            </>
          )}

          {/* Instructions */}
          {!analysis && !isRecording && !audioBlob && (
            <div className="card instructions-card">
              <h2 className="card-title">How to Use</h2>
              <ol className="instructions-list">
                <li>Click "Start Recording" to begin capturing your speech</li>
                <li>Speak naturally into your microphone</li>
                <li>Click "Stop Recording" when finished</li>
                <li>Click "Analyze Speech" to get your results</li>
                <li>
                  View your WPM, filler words, pauses, and full transcription
                </li>
              </ol>
              <div className="info-note">
                <strong>Note:</strong> Make sure to grant microphone access when
                prompted.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
