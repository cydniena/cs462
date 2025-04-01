  import React from "react";
  import { Pie } from "react-chartjs-2";
  import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
  } from "chart.js";

  ChartJS.register(ArcElement, Tooltip, Legend);

  const PieChart = ({ data }) => {
    // Data for the pie chart
    const chartData = {
      labels: [
        "Booked & Utilized",
        "Booked & Unutilized",
        "Not Booked & Utilized",
        "Not Booked & Unutilized",
      ],
      datasets: [
        {
          label: "Room Status Distribution",
          data: data, // Array of percentages for each category
          backgroundColor: ["#4CAF50", "#FF9800", "#2196F3", "#F44336"], // Colors for each category
          hoverBackgroundColor: ["#45D36D", "#FFC107", "#64B5F6", "#E57373"],
        },
      ],
    };

    // Options for the pie chart
    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom", // Position the legend at the bottom
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              const dataset = tooltipItem.dataset;
              const currentValue = dataset.data[tooltipItem.dataIndex];
              const total = dataset.data.reduce((acc, value) => acc + value, 0);
              const percentage = ((currentValue / total) * 100).toFixed(2);
              return `${tooltipItem.label}: ${percentage}%`;
            },
          },
        },
      },
    };

    return (
      <div className="p-4">
        <h2 className="text-center text-lg font-bold mb-4">Room Status Overview</h2>
        <Pie data={chartData} options={chartOptions} />
      </div>
    );
  };

  export default PieChart;