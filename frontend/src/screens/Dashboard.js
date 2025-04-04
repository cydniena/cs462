import React, { useState, useEffect } from "react";
import axios from "axios";
import RoomStats from "./Room/RoomStats";
import BookedUtilized from "./Room/BookedUtilized";
import AvgBookingUtilisation from "./Room/AvgBookingUtilisation";
import RoomWeekly from "./Room/RoomWeekly";
import PerRoomLine from "../components/PerRoomLine";
import CurrentOccupation from "./Room/CurrentOccupation";

const Dashboard = () => {
  const [roomsOccupancy, setRoomsOccupancy] = useState([]);
  const [booking, setBooking] = useState([]);
  const [timeRange, setTimeRange] = useState("day");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedHour, setSelectedHour] = useState("8");
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedFacilityType, setSelectedFacilityType] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedDetailRoom, setDetailRoom] = useState("");

  const buildings = [
    { name: "School of Computing & Information Systems 1", id: "SCIS1" },
    {
      name: "School of Economics/School of Computing & Information Systems 2",
      id: "SCIS2",
    },
  ];

  const facilityTypes = ["Classroom", "Seminar Room"];

  const floors = {
    SCIS1: [3, 4], // Floors 3 and 4 for SCIS1
    SCIS2: [3, 4], // Floors 3 and 4 for SCIS2
  };

  const rooms = {
    SCIS1: {
      3: ["3-1", "3-2"],
      4: ["4-1", "4-2"],
    },
    SCIS2: {
      3: ["3-1", "3-2"],
      4: ["4-1", "4-2"],
    },
  };

  // Fetch rooms data
  useEffect(() => {
    const fetchRoomsOccupancy = async () => {
      try {
        const response = await axios.get("http://localhost:5005/api/rooms");
        setRoomsOccupancy(response.data);
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

    fetchRoomsOccupancy();
    fetchBookings();
  }, []);

  // Handle filter changes
  const handleBuildingChange = (e) => {
    setSelectedBuilding(e.target.value);
    setSelectedFloor(""); // Reset floor
    setSelectedRoom(""); // Reset room
  };

  const handleFloorChange = (e) => {
    setSelectedFloor(e.target.value);
    setSelectedRoom(""); // Reset room
  };

  const handleFacilityTypeChange = (e) => {
    setSelectedFacilityType(e.target.value);
    setSelectedRoom(""); // Reset room
  };

  const handleRoomChange = (e) => {
    const selectedRoomValue = e.target.value;
    setSelectedRoom(selectedRoomValue);

    // Construct the room name in the desired format
    if (
      selectedBuilding &&
      selectedFloor &&
      selectedFacilityType &&
      selectedRoomValue
    ) {
      const roomName = `${selectedBuilding} ${selectedFacilityType} ${selectedRoomValue}`;
      setDetailRoom(roomName);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-center text-2xl font-bold mb-6">
        Room Utilization Dashboard
      </h1>

      {/* Filter Section */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow space-y-6">
        {/* Building Filters */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Building Filters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Building Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Building
              </label>
              <select
                className="border rounded-md px-3 py-2 w-full"
                value={selectedBuilding}
                onChange={handleBuildingChange}
              >
                <option value="">Select Building</option>
                {buildings.map((building) => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Floor Filter */}
            {selectedBuilding && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor
                </label>
                <select
                  className="border rounded-md px-3 py-2 w-full"
                  value={selectedFloor}
                  onChange={handleFloorChange}
                >
                  <option value="">Select Floor</option>
                  {floors[selectedBuilding]?.map((floor) => (
                    <option key={floor} value={floor}>
                      Floor {floor}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Facility Type */}
            {selectedBuilding && selectedFloor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facility Type
                </label>
                <select
                  className="border rounded-md px-3 py-2 w-full"
                  value={selectedFacilityType}
                  onChange={handleFacilityTypeChange}
                >
                  <option value="">Select Facility Type</option>
                  {facilityTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Room Filter */}
            {selectedFacilityType && selectedBuilding && selectedFloor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room
                </label>
                <select
                  className="border rounded-md px-3 py-2 w-full"
                  value={selectedRoom}
                  onChange={handleRoomChange}
                >
                  <option value="">Select Room</option>
                  {rooms[selectedBuilding]?.[selectedFloor]?.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Time Filters */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Time Filters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Time Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Range
              </label>
              <select
                className="border rounded-md px-3 py-2 w-full"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="hour">Hour</option>
              </select>
            </div>

            {/* Date */}
            {(timeRange === "day" ||
              timeRange === "week" ||
              timeRange === "hour") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  className="border rounded-md px-3 py-2 w-full"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            )}

            {/* Hour (only for hourly view) */}
            {timeRange === "hour" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hour
                </label>
                <select
                  className="border rounded-md px-3 py-2 w-full"
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
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <CurrentOccupation
          occupancyData={roomsOccupancy}
          roomName={selectedDetailRoom}
        />
      </div>

      <div className="mt-8">
        <RoomStats
          occupancyData={roomsOccupancy}
          bookings={booking}
          roomName={selectedDetailRoom}
          timeRange={timeRange}
          selectedDate={selectedDate}
          selectedHour={selectedHour}
        />
      </div>
      <div className="mt-8">
        <BookedUtilized
          occupancyData={roomsOccupancy}
          bookings={booking}
          roomName={selectedDetailRoom}
          timeRange={timeRange}
          selectedDate={selectedDate}
          selectedHour={selectedHour}
        />
      </div>
      <div className="mt-8">
        <AvgBookingUtilisation
          occupancyData={roomsOccupancy}
          bookings={booking}
          roomName={selectedDetailRoom}
          timeRange={timeRange}
          selectedDate={selectedDate}
          selectedHour={selectedHour}
        />
      </div>
      <div className="mt-8">
        <PerRoomLine
          occupancyData={roomsOccupancy}
          bookings={booking}
          roomName={selectedDetailRoom}
          timeRange={timeRange}
          selectedDate={selectedDate}
          selectedHour={selectedHour}
        />
      </div>
      <div className="mt-8">
        <RoomWeekly
          occupancyData={roomsOccupancy}
          bookings={booking}
          roomName={selectedDetailRoom}
          timeRange={timeRange}
          selectedDate={selectedDate}
          selectedHour={selectedHour}
        />
      </div>
    </div>
  );
};

export default Dashboard;
