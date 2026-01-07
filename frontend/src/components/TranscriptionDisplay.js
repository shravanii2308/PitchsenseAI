import React from "react";

const TranscriptionDisplay = ({ transcription }) => {
  if (!transcription) {
    return null;
  }

  return (
    <div className="card transcription-card" data-testid="transcription-text">
      <h2 className="card-title">Transcription</h2>
      <div className="transcription-content">
        {transcription || "No transcription available"}
      </div>
    </div>
  );
};

export default TranscriptionDisplay;
