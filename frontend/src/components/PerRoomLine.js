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

const LineChart = ({ occupancyData, roomName, timeRange = "", selectedDate = "", selectedHour = "" }) => {
  // Filter data for the specific room
  const roomData = useMemo(() => {
    return occupancyData.filter((data) => data.FacilityName === roomName);
  }, [occupancyData, roomName]);

  // Filter data based on the selected time range
  const filteredData = useMemo(() => {
    if (!roomData.length) return [];
    
    return roomData.filter((entry) => {
      const entryDate = new Date(entry.Time);
      const entryHour = entryDate.getHours();
      const entryDay = entryDate.toDateString();
      const startOfWeek = new Date(entryDate);
      const dayOfWeek = (entryDate.getDay() + 6) % 7; // Adjust so Monday is 0
      startOfWeek.setDate(entryDate.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);
      
      if (timeRange === "hour" || timeRange === "day") {
        return entryDay === new Date(selectedDate).toDateString() && entryHour >= 8 && entryHour <= 22;
      }
      if (timeRange === "week") {
        const selectedStartOfWeek = new Date(selectedDate);
        const selectedDayOfWeek = (selectedStartOfWeek.getDay() + 6) % 7;
        selectedStartOfWeek.setDate(selectedStartOfWeek.getDate() - selectedDayOfWeek);
        selectedStartOfWeek.setHours(0, 0, 0, 0);
        return entryDate >= selectedStartOfWeek && entryDate < new Date(selectedStartOfWeek).setDate(selectedStartOfWeek.getDate() + 7);
      }
      return true;
    });
  }, [roomData, timeRange, selectedDate, selectedHour]);

  // Calculate utilization for the filtered data
  const utilizationData = useMemo(() => {
    const utilizationMap = {};
    
    if (timeRange === "week") {
      for (let i = 0; i < 7; i++) {
        utilizationMap[i] = { count: 0, capacity: 0, entries: 0 };
      }
    } else {
      for (let hour = 8; hour <= 22; hour++) {
        utilizationMap[hour] = { count: 0, capacity: 0 };
      }
    }
    
    filteredData.forEach((entry) => {
      const entryDate = new Date(entry.Time);
      const entryHour = entryDate.getHours();
      const entryWeekday = (entryDate.getDay() + 6) % 7; // Adjust so Monday is 0
      
      if (timeRange === "week") {
        utilizationMap[entryWeekday].count += entry.Count;
        utilizationMap[entryWeekday].capacity = Math.max(utilizationMap[entryWeekday].capacity, entry.Capacity);
        utilizationMap[entryWeekday].entries++;
      } else if (utilizationMap[entryHour]) {
        utilizationMap[entryHour].count += entry.Count;
        utilizationMap[entryHour].capacity = Math.max(utilizationMap[entryHour].capacity, entry.Capacity);
      }
    });
    
    return Object.keys(utilizationMap).map((key) => ({
      label: timeRange === "week" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][key] : `${key}:00`,
      utilization: utilizationMap[key].capacity > 0 
        ? Math.min(((utilizationMap[key].count / (timeRange === "week" ? utilizationMap[key].entries || 1 : 1)) / utilizationMap[key].capacity) * 100, 100) // Prevent exceeding 100%
        : 0,
    }));
  }, [filteredData, timeRange]);

  // Prepare data for the chart
  const chartData = {
    labels: utilizationData.map((data) => data.label),
    datasets: [
      {
        label: "Utilization",
        data: utilizationData.map((data) => data.utilization),
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            return `Utilization: ${tooltipItem.raw.toFixed(2)}%`;
          },
        },
      },
    },
    scales: {
      x: { title: { display: true, text: timeRange === "week" ? "Day" : "Time" } },
      y: { title: { display: true, text: "Utilization (%)" }, min: 0, max: 100 },
    },
  };

  return (
    <div className="p-4">
      <h2 className="text-center text-lg font-bold mb-4">Real-Time Room Utilization</h2>
      <h3 className="text-center text-md font-semibold mb-4">{roomName}</h3>
      <div className="text-center text-sm text-gray-600 mb-4">
        {timeRange === "hour" || timeRange === "day" ? `Date: ${selectedDate}` : 
         timeRange === "week" ? `Week of ${selectedDate}` : ""}
      </div>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default LineChart;
