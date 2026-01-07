import React from "react";
import { Line } from "react-chartjs-2";

const WPMChart = ({ wpmHistory }) => {
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

  if (wpmHistory.length === 0) {
    return null;
  }

  return (
    <div className="card chart-card" data-testid="wpm-chart">
      <h2 className="card-title">Real-Time Speed Graph</h2>
      <div className="chart-container">
        <Line data={wpmChartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default WPMChart;
