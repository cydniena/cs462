import React, { useState, useEffect } from "react";
import axios from "axios";
import RoomTable from "../components/RoomTable";
import RoomStats from "./RoomStats";
import BookedUtilized from "./BookedUtilized";
import PieChart from "../components/PieChart";
import LineChart from "../components/LineChart";
import HeatMap from "../components/HeatMap";

const RoomWeekly = () => {
  const [rooms, setRooms] = useState([]);
  const [booking, setBooking] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [uniqueRooms, setUniqueRooms] = useState([]); // All rooms list for the dropdown
  const [allRooms, setAllRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(""); // Store the selected room
  

  // Fetch all rooms data for dropdown
  useEffect(() => {
    const fetchAllRooms = async () => {
      try {
        const response = await axios.get("http://localhost:5005/api/rooms");

        // Store all room data
        setAllRooms(response.data);

        // Remove duplicate FacilityNames for dropdown selection
        const uniqueRooms = [
          ...new Map(response.data.map((room) => [room.FacilityName, room])).values(),
        ];
        setAllRooms(uniqueRooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchAllRooms();
    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://localhost:5005/api/rooms");
        setRooms(response.data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };
    fetchRooms();
  }, []);


  // Generate heatmap data for a specific room
  const generateHeatmapData = (selectedRoom) => {
    if (!selectedRoom) return;
    
    // Get all room records with the same FacilityName
    const roomData = rooms.filter((room) => room.FacilityName === selectedRoom);
    // Convert room data into heatmap format (day of the week, hour, usage count)
    const formattedData = roomData.map((room) => {
      if (!room.Time) return null;
      const date = new Date(room.Time);
      return {
        Time: room.Time,
        Count: room.Count
      }
      
    }).filter(Boolean); // Remove any invalid entries

    setHeatmapData(formattedData);
    setRooms(roomData);
    
  };

  const handleRoomSelection = () => {
    if (selectedRoom) {
      generateHeatmapData(selectedRoom);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-center text-2xl font-bold mb-6">Room Utilization</h1>

      {/* Room Dropdown */}
      <div className="mb-4">
        <select
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Select a room</option>
          {allRooms.map((room) => (
            <option key={room._id} value={room.FacilityName}>
              {room.FacilityName}
            </option>
          ))}
        </select>
        <button
          onClick={handleRoomSelection}
          className="ml-4 p-2 bg-blue-500 text-white rounded"
        >
          Select Room
        </button>
      </div>

      {/* Display heatmap */}
      {rooms.length > 0 && (
        <div className="mt-8" style={{ width: "700px", height: "500px", margin: "0 auto" }}>
          <HeatMap data={heatmapData} />
        </div>
      )}
    </div>
  );
};


export default RoomWeekly;