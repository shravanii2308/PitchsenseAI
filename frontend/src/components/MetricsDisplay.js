import React from "react";

const MetricsDisplay = ({ analysis }) => {
  return (
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
          <div className="metric-value">{analysis.pauses?.length || 0}</div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDisplay;
