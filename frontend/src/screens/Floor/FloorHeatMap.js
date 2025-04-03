import React, { useMemo } from "react";
import { startOfWeek, endOfWeek } from "date-fns";

const FloorHeatMap = ({
  occupancyData = [],
  timeRange = "",
  selectedDate = "",
  selectedHour = "",
}) => {
  //const [filterType, setFilterType] = useState("day");
  //const [selectedDate, setSelectedDate] = useState("2025-01-17");
  //const [selectedHour, setSelectedHour] = useState("8"); // Default to 8 AM

  // Filtered data based on selected date, filter type, and selected hour
  const filteredData = useMemo(() => {
    if (!occupancyData || occupancyData.length === 0) return [];
    const selectedStart = new Date(selectedDate);

    if (timeRange === "week") {
      const weekStart = startOfWeek(selectedStart, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(selectedStart, { weekStartsOn: 1 }); // Sunday
      return occupancyData.filter(({ Time }) => {
        const date = new Date(Time);
        return date >= weekStart && date <= weekEnd;
      });
    } else if (timeRange === "day") {
      return occupancyData.filter(({ Time }) => {
        const date = new Date(Time);
        return date.toDateString() === selectedStart.toDateString();
      });
    } else if (timeRange === "hour") {
      const selectedHourInt = parseInt(selectedHour, 10); // Convert hour to integer
      return occupancyData.filter(({ Time }) => {
        const date = new Date(Time);
        return (
          date.toDateString() === selectedStart.toDateString() &&
          date.getHours() === selectedHourInt
        );
      });
    }

    return [];
  }, [occupancyData, timeRange, selectedDate, selectedHour]);

  // Table data preparation for hourly usage
  const tableData = useMemo(() => {
    if (!Array.isArray(filteredData) || filteredData.length === 0) return [];

    const rooms = Array.from(
      new Set(filteredData.map(({ FacilityName }) => FacilityName))
    );

    // Define the hours (8 AM - 10 PM)
    const hours = Array.from({ length: 15 }, (_, i) => `${i + 8}:00`);

    return hours.map((hour) => {
      const hourData = { id: hour };
      rooms.forEach((room) => {
        const entriesForHour = filteredData.filter(({ FacilityName, Time }) => {
          const date = new Date(Time);
          return FacilityName === room && `${date.getHours()}:00` === hour;
        });

        if (timeRange === "week") {
          const totalUsage = entriesForHour.reduce(
            (acc, entry) => acc + (entry.Count || 0),
            0
          );
          const averageUsage =
            entriesForHour.length > 0 ? totalUsage / entriesForHour.length : 0;
          hourData[room] = averageUsage;
        } else if (timeRange === "day" || timeRange === "hour") {
          const entry = entriesForHour.length > 0 ? entriesForHour[0] : null;
          hourData[room] = entry && entry.Count > 0 ? 1 : 0; // Shaded if used
        }
      });
      return hourData;
    });
  }, [filteredData, timeRange]);

  const hours = Array.from({ length: 15 }, (_, i) => `${i + 8}:00`); // 8 AM - 10 PM
  const roomIds = Array.from(
    new Set(filteredData.map(({ FacilityName }) => FacilityName))
  );

  return (
    <div className="p-4">
      <h1>Heatmap for each floor</h1>
      {/* <div className="flex space-x-4 mb-4 items-center">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="hour">Hour</option>
        </select>

        <input
          type="date"
          value={format(new Date(selectedDate), "yyyy-MM-dd")}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />

        {filterType === "hour" && (
          <select
            value={selectedHour}
            onChange={(e) => setSelectedHour(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          >
            {Array.from({ length: 15 }, (_, i) => (
              <option key={i} value={i + 8}>
                {i + 8}:00
              </option>
            ))}
          </select>
        )}
      </div> */}

      <div className="flex space-x-4 mb-4 items-center">
        <table className="table-auto border-collapse border border-gray-300 w-full">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Room</th>
              {hours.map((hour) => (
                <th key={hour} className="border border-gray-300 p-2">
                  {hour}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roomIds.map((roomId) => (
              <tr key={roomId}>
                <td className="border border-gray-300 p-2">{roomId}</td>
                {hours.map((hour) => {
                  const hourData = tableData.find((h) => h.id === hour);
                  const usage = hourData && hourData[roomId];

                  let bgColor = "transparent"; // Default color (unshaded)
                  if (timeRange === "week") {
                    // Shading for weekly view based on average usage
                    if (usage > 0.8) bgColor = "orange";
                    else if (usage > 0.5) bgColor = "yellow";
                    else if (usage > 0.2) bgColor = "lightgreen";
                  } else if (timeRange === "day" || timeRange === "hour") {
                    // Shading for daily or hourly view (fully utilized is orange)
                    bgColor = usage > 0 ? "orange" : "transparent";
                  }

                  return (
                    <td
                      key={hour}
                      className="border border-gray-300 p-2"
                      style={{
                        backgroundColor: bgColor,
                      }}
                    ></td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FloorHeatMap;
