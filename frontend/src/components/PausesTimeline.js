import React from "react";

const PausesTimeline = ({ pauses }) => {
  if (!pauses || pauses.length === 0) {
    return null;
  }

  return (
    <div className="card" data-testid="pauses-timeline">
      <h2 className="card-title">Pause Duration Analysis</h2>
      <div className="pauses-container">
        {pauses.map((pause, index) => (
          <div key={index} className="pause-item">
            <div
              className="pause-bar"
              style={{ width: `${Math.min(pause.duration * 50, 300)}px` }}
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
  );
};

export default PausesTimeline;
