import React, { useState, useEffect } from "react";
import { startOfWeek, addDays, parseISO, format } from "date-fns";
import "../css/summary.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const Charts = ({ utilizationData, bookingsData, selectedRoom }) => {
  const [timeRange, setTimeRange] = useState("day");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedHour, setSelectedHour] = useState("8");
  const [processedData, setProcessedData] = useState({});
  const hours = Array.from({ length: 15 }, (_, i) => 8 + i); // 8 AM - 10 PM

  useEffect(() => {
    if (!utilizationData || !Array.isArray(utilizationData)) return;

    const selected = parseISO(selectedDate);

    const weekStart = startOfWeek(selected, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);

    // Filter for hourly chart
    const filteredHourlyData = utilizationData.filter((entry) => {
      const entryDate = parseISO(entry.Time);
      const sameRoom = entry.FacilityName === selectedRoom;

      if (timeRange === "hour") {
        return (
          sameRoom &&
          format(entryDate, "yyyy-MM-dd") === format(selected, "yyyy-MM-dd") &&
          entryDate.getHours() === parseInt(selectedHour)
        );
      } else if (timeRange === "day") {
        return (
          sameRoom &&
          format(entryDate, "yyyy-MM-dd") === format(selected, "yyyy-MM-dd")
        );
      } else if (timeRange === "week") {
        return sameRoom && entryDate >= weekStart && entryDate <= weekEnd;
      }

      return false;
    });

    // Filter for daily chart (always full week)
    const filteredDailyData = utilizationData.filter((entry) => {
      const entryDate = parseISO(entry.Time);
      return (
        entry.FacilityName === selectedRoom &&
        entryDate >= weekStart &&
        entryDate <= weekEnd
      );
    });

    // Process Hourly Data
    const hourly = [];

    if (timeRange === "week") {
      const hourMap = {}; // {hour: { total: x, count: y }}

      filteredHourlyData.forEach((entry) => {
        const entryDate = parseISO(entry.Time);
        const hour = entryDate.getHours();
        const utilization =
          entry.Capacity === 0 ? 0 : (entry.Count / entry.Capacity) * 100;

        if (!hourMap[hour]) {
          hourMap[hour] = { total: 0, count: 0 };
        }

        hourMap[hour].total += utilization;
        hourMap[hour].count += 1;
      });

      for (let h = 8; h <= 22; h++) {
        const hourStats = hourMap[h] || { total: 0, count: 0 };
        hourly.push({
          hour: h,
          utilization:
            hourStats.count === 0
              ? 0
              : Math.round(hourStats.total / hourStats.count),
        });
      }
    } else {
      filteredHourlyData.forEach((entry) => {
        const entryDate = parseISO(entry.Time);
        const hour = entryDate.getHours();
        const utilization =
          entry.Capacity === 0 ? 0 : (entry.Count / entry.Capacity) * 100;

        hourly.push({ hour, utilization: Math.round(utilization) });
      });
    }

    // Process Daily Data
    const dailyMap = {};
    filteredDailyData.forEach((entry) => {
      const dateKey = format(parseISO(entry.Time), "yyyy-MM-dd");
      const utilization =
        entry.Capacity === 0 ? 0 : (entry.Count / entry.Capacity) * 100;

      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { total: 0, count: 0 };
      }
      dailyMap[dateKey].total += utilization;
      dailyMap[dateKey].count += 1;
    });

    const daily = Object.entries(dailyMap).map(
      ([dateStr, { total, count }]) => ({
        day: format(parseISO(dateStr), "EEE"),
        utilization: Math.round(total / count),
      })
    );

    setProcessedData({ hourly, daily });
  }, [utilizationData, selectedDate, selectedHour, timeRange, selectedRoom]);

  const hourlyData = processedData.hourly || [];
  const dailyData = processedData.daily || [];

  return (
    <div className="utilization-container">
      <h1>{selectedRoom} Utilization Summary</h1>

      <h3 className="text-lg font-bold text-gray-800 mb-4">Time Filters</h3>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "20px",
          alignItems: "center",
          flexWrap: "wrap",
          flexDirection: "row",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <label htmlFor="timeRange">Time Filter:</label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ padding: "5px" }}
          >
            <option value="hour">By Hour</option>
            <option value="day">By Day</option>
            <option value="week">By Week</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <label htmlFor="datePicker">Date:</label>
          <input
            type="date"
            id="datePicker"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: "5px" }}
          />
        </div>

        {timeRange === "hour" && (
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <label htmlFor="hourPicker">Hour:</label>
            <select
              id="hourPicker"
              value={selectedHour}
              onChange={(e) => setSelectedHour(e.target.value)}
              style={{ padding: "5px" }}
            >
              {hours.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}:00
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Hourly Utilization Overview Chart */}
      <div className="chart-box" style={{ width: "40%" }}>
        <h2>Hourly Utilization Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Bar dataKey="utilization" fill="#4CAF50" />
            <ReferenceLine
              y={70}
              label="Expected (70%)"
              stroke="black"
              strokeDasharray="3 3"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Average Utilization Overview Chart */}
      <div className="chart-box" style={{ width: "40%" }}>
        <h2>Daily Average Utilization Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Bar dataKey="utilization" fill="#2196F3" />
            <ReferenceLine
              y={70}
              label="Expected (70%)"
              stroke="black"
              strokeDasharray="3 3"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
