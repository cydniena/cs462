import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js";
import { MatrixController, MatrixElement } from "chartjs-chart-matrix";

Chart.register(MatrixController, MatrixElement);

const HeatMap = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Destroy previous chart instance if exists
    if (chartRef.current && chartRef.current.chart) {
      chartRef.current.chart.destroy();
    }

    // Map day numbers to readable labels
    const dayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const formattedData = data.map((room) => {
      if (!room.Time) return null;

      const date = new Date(room.Time);
      const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const hour = date.getHours(); // 0 - 23
      const proportion = room.Count/room.Capacity
      return {
        x: day, // Day of the week (0-6)
        y: hour, // Hour of the day (0-23)
        v: proportion, // Room usage count
      };
    }).filter(Boolean); // Remove any invalid entries

    const ctx = chartRef.current.getContext("2d");

    // Handle empty data case
    if (formattedData.length === 0) {
      console.error("Invalid data for heatmap", data);
      return;
    }

    const heatmapData = {
      datasets: [
        {
          label: "Room Utilization Heatmap",
          data: formattedData,
          backgroundColor: (context) => {
            const value = context.raw.v;
            if (value > 0.9) return "rgba(255, 0, 0, 0.6)"; // High usage
            if (value > 0.7) return "rgba(255, 200, 0, 0.6)"; 
            if (value > 0.5) return "rgba(255, 100, 0, 0.6)";
            if (value > 0.2) return "rgba(150, 200, 0, 0.6)"; // Medium usage
            return "rgba(0, 255, 0, 0.6)"; // Low usage
          },
          width: ({ chart }) => (chart.chartArea ? chart.chartArea.width / 7 : 0), // 7 days in a week
          height: ({ chart }) => (chart.chartArea ? chart.chartArea.height / 24 : 0), // 24 hours in a day
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "category",
          labels: dayLabels, // Days of the week as labels
          position: "bottom",
          title: {
            display: true,
            text: "Day of the Week",
          },
        },
        y: {
          type: "linear",
          position: "left",
          min: 0,
          max: 23,
          reverse: true,
          ticks: {
            stepSize: 1,
          },
          title: {
            display: true,
            text: "Hour of the Day",
          },
        },
      },
    };

    const chart = new Chart(ctx, {
      type: "matrix",
      data: heatmapData,
      options: options,
    });

    chartRef.current.chart = chart;

    // Cleanup on component unmount
    return () => {
      if (chartRef.current && chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }
    };
  }, [data]);

  return (
    <div style={{ position: "relative", height: "500px", width: "700px" }}>
      <canvas ref={chartRef}></canvas>
    </div>
    
  );
};

export default HeatMap;