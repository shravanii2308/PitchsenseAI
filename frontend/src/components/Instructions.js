import React from "react";

const Instructions = () => {
  return (
    <div className="card instructions-card">
      <h2 className="card-title">How to Use</h2>
      <ol className="instructions-list">
        <li>Click "Start Recording" to begin capturing your speech</li>
        <li>Speak naturally into your microphone</li>
        <li>Click "Stop Recording" when finished</li>
        <li>Click "Analyze Speech" to get your results</li>
        <li>View your WPM, filler words, pauses, and full transcription</li>
      </ol>
      <div className="info-note">
        <strong>Note:</strong> Make sure to grant microphone access when
        prompted.
      </div>
    </div>
  );
};

export default Instructions;
