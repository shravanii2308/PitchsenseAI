import React from "react";

const RecordingControls = ({
  isRecording,
  audioBlob,
  isProcessing,
  error,
  recordingTime,
  onStartRecording,
  onStopRecording,
  onAnalyze,
  onReset,
  formatTime,
}) => {
  return (
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
            onClick={onStartRecording}
            className="btn btn-primary"
            data-testid="start-recording-button"
          >
            <span className="btn-icon">🎙️</span>
            Start Recording
          </button>
        )}

        {isRecording && (
          <button
            onClick={onStopRecording}
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
              onClick={onAnalyze}
              className="btn btn-success"
              data-testid="analyze-button"
            >
              <span className="btn-icon">📊</span>
              Analyze Speech
            </button>
            <button
              onClick={onReset}
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
  );
};

export default RecordingControls;
