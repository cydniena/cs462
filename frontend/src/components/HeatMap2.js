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

    // Map day numbers to readable labels starting from Monday
    const dayLabels = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const formattedData = data
      .map((room) => {
        if (!room.Time) return null;

        const date = new Date(room.Time);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        let day = date.getDay(); // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        
        // Fix to shift Sunday (0) to Saturday (6), keep other days aligned with labels
        day = day === 0 ? 6 : day - 1;
        console.log("DAY: ", day);

        const hour = date.getHours(); // Get the hour (0 - 23)
        console.log("HOUR: ", hour);
        const proportion = room.Count / room.Capacity;

        return {
          x: dayName, // Day of the week (0-6, adjusted)
          y: hour, // Hour of the day (0-23)
          v: proportion, // Room usage proportion
          Category: room.Category, // Add category to data point
        };
      })
      .filter(Boolean) // Remove any invalid entries
      
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
            const category = context.raw.Category;
            if (category === "Booked and Unutilised")
              return "rgba(255, 0, 0, 0.6)"; // Red
            if (category === "Unbooked and Utilised")
              return "rgba(255, 200, 0, 0.6)"; // Yellow
            return "rgba(0, 255, 0, 0.6)"; // Green (Unbooked and Unutilised)
          },
          width: ({ chart }) =>
            chart.chartArea ? chart.chartArea.width / 7 : 0,
          height: ({ chart }) =>
            chart.chartArea ? chart.chartArea.height / 16 : 0, // Reduced the height (24 to 16) to fit 8AM-10PM range
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "category",
          labels: dayLabels, // Days of the week as labels (Monday to Sunday)
          position: "bottom",
          title: {
            display: true,
            text: "Day of the Week",
          },
        },
        y: {
          type: "linear",
          position: "left",
          min: 7, // Start from 8 AM (hour 8)
          max: 23, // End at 10 PM (hour 22)
          reverse: false,
          ticks: {
            stepSize: 1,
          },
          title: {
            display: true,
            text: "Hour of the Day",
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            // Custom tooltip to show category along with the proportion
            label: function (tooltipItem) {
              const category = tooltipItem.raw.Category;
              const proportion = tooltipItem.raw.v;
              return `${category}: ${(proportion * 100).toFixed(1)}%`; // Show category and proportion
            },
          },
        },
        legend: {
          display: true,
          labels: {
            // Generate only categories other than "Booked and Utilised"
            generateLabels: function (chart) {
              const labels = chart.data.datasets[0].data.map(
                (item) => item.Category
              );
              const uniqueCategories = [...new Set(labels)];
              // Filter out "Booked and Utilised" from legend
              const filteredCategories = uniqueCategories.filter(
                (category) => category !== "Booked and Utilised"
              );

              return filteredCategories.map((category) => {
                let fillStyle;
                switch (category) {
                  case "Booked and Unutilised":
                    fillStyle = "rgba(255, 0, 0, 0.6)";
                    break;
                  case "Unbooked and Utilised":
                    fillStyle = "rgba(255, 200, 0, 0.6)";
                    break;
                  case "Unbooked and Unutilised":
                    fillStyle = "rgba(0, 255, 0, 0.6)";
                    break;
                  default:
                    fillStyle = "rgba(0, 0, 0, 0.6)"; // Default color if needed
                }
                return {
                  text: category,
                  fillStyle,
                  strokeStyle: fillStyle,
                  lineWidth: 2,
                  hidden: false,
                };
              });
            },
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
