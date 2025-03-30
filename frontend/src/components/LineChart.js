import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale
);

const LineChart = ({ occupancyData, roomName }) => {
  // Filter data for the specific room
  const roomData = useMemo(() => {
    return occupancyData.filter((data) => data.FacilityName === roomName);
  }, [occupancyData, roomName]);

  console.log("Filtered Room Data:", roomData);

  // Calculate utilization for each hour
  const utilizationData = useMemo(() => {
    const hourlyUtilization = {};

    roomData.forEach((entry) => {
      const hour = new Date(entry.Time).getHours(); // Extract the hour

      if (!hourlyUtilization[hour]) {
        hourlyUtilization[hour] = { count: 0, capacity: entry.Capacity };
      }

      // Increment the count for the hour
      hourlyUtilization[hour].count += entry.Count;

      // Ensure the capacity is consistent (take the maximum capacity for the hour)
      hourlyUtilization[hour].capacity = Math.max(
        hourlyUtilization[hour].capacity,
        entry.Capacity
      );
    });

    return Object.keys(hourlyUtilization).map((hour) => ({
      hour,
      utilization:
        hourlyUtilization[hour].capacity > 0
          ? hourlyUtilization[hour].count / hourlyUtilization[hour].capacity
          : 0,
    }));
  }, [roomData]);

  // Calculate the date range
  const dateRange = useMemo(() => {
    if (roomData.length === 0) return "No data available";
    const dates = roomData.map((entry) => new Date(entry.Time));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    return `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`;
  }, [roomData]);

  // Prepare data for the chart
  const chartData = {
    labels: utilizationData.map((data) => `${data.hour}:00`), // X-axis labels (hours)
    datasets: [
      {
        label: "Utilization",
        data: utilizationData.map((data) => data.utilization * 100), // Y-axis data (percentage)
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        fill: true,
        tension: 0.4, // Smooth curve
        pointRadius: 5, // Make data points visible
        pointHoverRadius: 7, // Highlight data points on hover
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const hour = tooltipItem.label;
            const utilization = tooltipItem.raw.toFixed(2);
            return `Hour: ${hour}, Utilization: ${utilization}%`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time (Hour)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Utilization (%)",
        },
        min: 0, // Start Y-axis at 0
      },
    },
  };

  return (
    <div className="p-4">
      <h2 className="text-center text-lg font-bold mb-4">
        Real-Time Room Utilization
      </h2>
      <h3 className="text-center text-md font-semibold mb-4">{roomName}</h3> {/* Display room name */}
      <div className="text-center text-sm text-gray-600 mb-4">
        Date Range: {dateRange} {/* Display the date range */}
      </div>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default LineChart;