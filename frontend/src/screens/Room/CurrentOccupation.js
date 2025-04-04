import React, { useMemo } from "react";

const CurrentOccupation = ({ occupancyData = [], roomName = "" }) => {
  const today = useMemo(() => new Date().toISOString().split("T")[0], []); // Cached today's date for re-use

  // Function to format date to a user-friendly format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(); // Formats to 'MM/DD/YYYY, HH:MM:SS AM/PM'
  };

  // Function to calculate the room's occupancy data for today
  const getRoomOccupancyData = () => {
    const roomOccupancy = occupancyData
      .filter((entry) => entry.FacilityName === roomName)
      .sort((a, b) => new Date(b.Time) - new Date(a.Time)); // Sort by latest

    // Find today's data if it exists, else fallback to the latest available data
    const todayData = roomOccupancy.find((entry) => entry.Time.startsWith(today));
    return todayData || roomOccupancy[0];
  };

  const latestData = useMemo(getRoomOccupancyData, [occupancyData, roomName, today]);

  return (
    <div className="p-6 rounded-lg shadow-lg bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 max-w-lg mx-auto">
      <h3 className="text-2xl font-semibold text-gray-800 text-center mb-4">
        Current Room Occupancy
      </h3>
      {latestData ? (
        <div className="space-y-4 text-center">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-lg text-gray-700">
              <strong>Date:</strong> {formatDate(latestData.Time)}
            </p>
            <p className="text-lg text-gray-700">
              <strong>Occupancy:</strong> {latestData.Count} / {latestData.Capacity}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-lg text-red-500">No occupancy data available for this room.</p>
        </div>
      )}
    </div>
  );
};

export default CurrentOccupation;
