import React, { useState, useEffect } from "react";
import HeatMap from "../../components/HeatMap2";

const RoomWeekly = ({
  bookings = [],
  occupancyData = [],
  roomName = "",
  timeRange = "day",
  selectedDate = "",
  selectedHour = "",
}) => {
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (!roomName) return;

    // Filter occupancy data for the selected room
    let roomOccupancy = occupancyData.filter(
      (entry) => entry.FacilityName === roomName
    );

    // Apply time range filtering
    if (timeRange === "day" && selectedDate) {
      roomOccupancy = roomOccupancy.filter(
        (entry) =>
          new Date(entry.Time).toISOString().split("T")[0] === selectedDate
      );
    } else if (timeRange === "hour" && selectedDate && selectedHour !== "") {
      roomOccupancy = roomOccupancy.filter((entry) => {
        const entryDate = new Date(entry.Time);
        return (
          entryDate.toISOString().split("T")[0] === selectedDate &&
          entryDate.getHours() === parseInt(selectedHour, 10)
        );
      });
    }

    // Process data to categorize booking status
    const processedData = roomOccupancy.map((entry) => {
      const { Time, Count, Capacity, FacilityName } = entry;
      const entryDate = new Date(Time);

      const booking = bookings.find(
        (b) =>
          b.FacilityName === FacilityName &&
          new Date(b.BookingStartTime) <= entryDate &&
          new Date(b.BookingEndTime) > entryDate
      );

      let category = "Unbooked and Unutilised";
      if (booking) {
        category =
          Count === 0 ? "Booked and Unutilised" : "Booked and Utilised";
      } else if (Count > 0) {
        category = "Unbooked and Utilised";
      }

      return {
        Time,
        Count,
        Capacity,
        Category: category,
      };
    });

    // Filter out entries with "Booked and Utilised" category
    const filteredProcessedData = processedData.filter(
      (entry) => entry.Category !== "Booked and Utilised"
    );

    setFilteredData(filteredProcessedData);
  }, [
    bookings,
    occupancyData,
    roomName,
    timeRange,
    selectedDate,
    selectedHour,
  ]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Room Utilization Heatmap: {roomName}
      </h2>
      <HeatMap data={filteredData} timeRange={timeRange} />
    </div>
  );
};

export default RoomWeekly;
