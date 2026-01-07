import React from "react";

const FillerWordsHeatmap = ({ fillerWords }) => {
  if (!fillerWords || fillerWords.length === 0) {
    return null;
  }

  return (
    <div className="card" data-testid="filler-words-heatmap">
      <h2 className="card-title">Filler Word Heatmap</h2>
      <div className="heatmap-container">
        {fillerWords.map((filler, index) => (
          <div key={index} className="heatmap-item">
            <span className="heatmap-word">"{filler.word}"</span>
            <span className="heatmap-time">
              at {filler.timestamp.toFixed(1)}s
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FillerWordsHeatmap;
