import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import "../screens/css/summary.css";

const GridTable = ({ utilizationData, roomsData, selectedBuilding }) => {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const hours = Array.from({ length: 15 }, (_, i) => 8 + i); // 8 AM - 10 PM

  const calculateAverageUtilization = () => {
    let totalUtilization = 0;
    let dataPoints = 0;

    days.forEach((day) => {
      hours.forEach((hour) => {
        const data = utilizationData[day]?.[hour];
        if (data && !isNaN(data.utilization)) {
          totalUtilization += data.utilization;
          dataPoints++;
        }
      });
    });

    return dataPoints > 0 ? (totalUtilization / dataPoints).toFixed(2) : "0.00";
  };

  const getAverageUtilizationByHour = () => {
    return hours.map((hour) => {
      let total = 0;
      let count = 0;

      days.forEach((day) => {
        const data = utilizationData[day]?.[hour];
        if (data && !isNaN(data.utilization)) {
          total += data.utilization;
          count++;
        }
      });

      return {
        hour: `${hour}:00`,
        utilization: count > 0 ? (total / count).toFixed(2) : "0.00",
      };
    });
  };

  const getAverageUtilizationPerDay = () => {
    return days.map((day) => {
      let total = 0;
      let count = 0;

      hours.forEach((hour) => {
        const data = utilizationData[day]?.[hour];
        if (data && !isNaN(data.utilization)) {
          total += data.utilization;
          count++;
        }
      });

      return {
        day,
        utilization: count > 0 ? (total / count).toFixed(2) : "0.00",
      };
    });
  };

  const getCellColor = (percentage) => {
    if (percentage >= 80) return "high-utilization";
    if (percentage >= 60) return "medium-utilization";
    return "low-utilization";
  };

  const buildingRoomCounts = {
    SCIS1: 4,
    "SOE/SCIS2": 2,
  };

  const getRoomCount = () => {
    if (selectedBuilding) {
      return buildingRoomCounts[selectedBuilding] || roomsData.length;
    }
    return buildingRoomCounts["SCIS1"] + buildingRoomCounts["SOE/SCIS2"];
  };

  const averageUtilization = calculateAverageUtilization();
  const roomCount = getRoomCount();
  const hourlyData = getAverageUtilizationByHour();
  const dailyData = getAverageUtilizationPerDay();

  // Calculate average hourly utilization (sum of hourly percentages / 15 hours)
  const averageHourlyUtilization = (
    hourlyData.reduce(
      (acc, { utilization }) => acc + parseFloat(utilization),
      0
    ) / hours.length
  ).toFixed(2);

  // Calculate average daily utilization (sum of daily percentages / 7 days)
  const averageDailyUtilization = (
    dailyData.reduce(
      (acc, { utilization }) => acc + parseFloat(utilization),
      0
    ) / days.length
  ).toFixed(2);

  // Calculate average weekly utilization
  const averageWeeklyUtilization = (
    (parseFloat(averageHourlyUtilization) +
      parseFloat(averageDailyUtilization)) /
    2
  ).toFixed(2);

  return (
    <div className="utilization-container">
      <h1>SMU Utilisation Summary</h1>

      <div className="dashboard-layout">
        <div className="table-container">
          <div className="utilization-grid">
            <div className="grid-row header">
              <div className="grid-cell time-label">Time/Day</div>
              {hours.map((hour) => (
                <div key={hour} className="grid-cell hour-header">
                  {hour}:00
                </div>
              ))}
            </div>

            {days.map((day) => (
              <div key={day} className="grid-row">
                <div className="grid-cell day-label">{day}</div>
                {hours.map((hour) => {
                  const data = utilizationData[day]?.[hour] || {
                    utilization: 0,
                  };
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className={`grid-cell ${getCellColor(data.utilization)}`}
                      title={`${day} ${hour}:00 - Utilization: ${data.utilization}%`}
                    >
                      {data.utilization}%
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Existing summary panel for space availability */}
        <div className="summary-panel">
          <div className="summary-card">
            <h3>Overall Building Availability</h3>
            <div className="summary-item">
              <span className="summary-label">Total Rooms:</span>
              <span className="summary-value">{roomCount}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Average Utilisation:</span>
              <span className="summary-value">{averageUtilization}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="legend">
        <div className="legend-item">
          <div className="legend-color low-utilization"></div>
          <span>Low Utilisation (0-59%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color medium-utilization"></div>
          <span>Medium Utilisation (60-79%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color high-utilization"></div>
          <span>High Utilisation (80-100%)</span>
        </div>
      </div>

      {/* Hourly and Daily Utilization Overview Charts - Side by Side */}
      <div
        className="charts-container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "40px",
        }}
      >
        <div className="summary-panel-right">
          <div className="summary-card">
            <h3>Utilization Overview</h3>
            <div className="summary-item">
              <span className="summary-label">Average Hourly Utilisation:</span>
              <span className="summary-value">{averageHourlyUtilization}%</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Average Daily Utilisation:</span>
              <span className="summary-value">{averageDailyUtilization}%</span>
            </div>
          </div>
        </div>

        {/* Hourly Utilization Overview Chart */}
        <div className="chart-box" style={{ width: "40%" }}>
          <h2>Hourly Utilisation Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Line
                type="monotone"
                dataKey="utilization"
                stroke="#4CAF50"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <ReferenceLine
                y={70}
                label={{ value: "Expected (70%)", position: "top" }}
                stroke="black"
                strokeDasharray="3 3"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Average Utilization Overview Chart */}
        <div className="chart-box" style={{ width: "40%" }}>
          <h2>Daily Average Utilisation Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tickFormatter={(day) => day.slice(0, 3)} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Line
                type="monotone"
                dataKey="utilization"
                stroke="#2196F3"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <ReferenceLine
                y={70}
                label={{ value: "Expected (70%)", position: "top" }}
                stroke="black"
                strokeDasharray="3 3"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GridTable;
