import React, { useState, useEffect } from "react";
import axios from "axios";
import RoomStats from "./Room/RoomStats";
import BookedUtilized from "./Room/BookedUtilized";
import FloorHeatMap from "./FloorHeatMap";
import AvgBookingUtilisation from "./Room/AvgBookingUtilisation";

const Dashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [booking, setBooking] = useState([]);
  const [timeRange, setTimeRange] = useState("day");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedHour, setSelectedHour] = useState("8");

  // Fetch rooms data
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://localhost:5005/api/rooms");
        setRooms(response.data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    const fetchBookings = async () => {
      try {
        const response = await axios.get("http://localhost:5005/api/bookings");
        setBooking(response.data);
      } catch (error) {
        console.error("Error fetching booking:", error);
      }
    };

    fetchRooms();
    fetchBookings();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-center text-2xl font-bold mb-6">Room Utilization</h1>

      {/* Time Range Filter */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Range
            </label>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="hour">Hour</option>
            </select>
          </div>

          {/* Date Picker (shown for day and week) */}
          {(timeRange === "day" || timeRange === "week") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          )}

          {/* Hour Picker (shown only for hour selection) */}
          {timeRange === "hour" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hour
                </label>
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(e.target.value)}
                >
                  {Array.from({ length: 15 }, (_, i) => {
                    const hour = 8 + i;
                    return (
                      <option key={hour} value={hour}>
                        {hour}:00
                      </option>
                    );
                  })}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-8">
        <RoomStats
          occupancyData={rooms}
          bookings={booking}
          roomName="SCIS1 Classroom 3-1"
          timeRange={timeRange}
          selectedDate={selectedDate}
          selectedHour={selectedHour}
        />
      </div>
      <div className="mt-8">
        <BookedUtilized
          occupancyData={rooms}
          bookings={booking}
          roomName="SCIS1 Classroom 3-1"
          timeRange={timeRange}
          selectedDate={selectedDate}
          selectedHour={selectedHour}
        />
      </div>
      <div className="mt-8">
        <AvgBookingUtilisation
          occupancyData={rooms}
          bookings={booking}
          roomName="SCIS1 Classroom 3-1"
          timeRange={timeRange}
          selectedDate={selectedDate}
          selectedHour={selectedHour}
        />
      </div>
      <div className="mt-8">
        <FloorHeatMap occupancyData={rooms} />
      </div>
    </div>
  );
  // <div className="p-4">
  //   <h1 className="text-center text-2xl font-bold mb-6">Room Utilization</h1>
  //   <div className="mb-8" style={{ display: "none" }}>
  //     <RoomTable data={rooms} />
  //   </div>
  //   <div className="mt-8">
  //     <RoomStats
  //       hourlyData={rooms}
  //       bookings={booking}
  //       roomName="SCIS1 Classroom 3-1"
  //     />
  //   </div>
  //   <div className="mt-8">
  //     <BookedUtilized
  //       occupancyData={rooms}
  //       bookings={booking}
  //       roomName="SCIS1 Classroom 3-1"
  //     />
  //   </div>
  //   <div className="mt-8">
  //     <FloorHeatMap occupancyData={rooms} />
  //   </div>
  //   <div className="mt-8">
  //     <AvgBookingUtilisation
  //       occupancyData={rooms}
  //       bookings={booking}
  //       roomName="SCIS1 Classroom 3-1"
  //     />
  //   </div>
  // </div>
  //);
};

export default Dashboard;
