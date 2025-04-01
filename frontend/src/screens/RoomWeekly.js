import React, { useState, useEffect } from "react";
import axios from "axios";
import HeatMap from "../components/HeatMap";

const RoomWeekly = () => {
  const [rooms, setRooms] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");

  useEffect(() => {
    const fetchAllRooms = async () => {
      try {
        const response = await axios.get("http://localhost:5005/api/rooms");
        const uniqueRooms = [
          ...new Map(response.data.map((room) => [room.FacilityName, room])).values(),
        ];
        setAllRooms(uniqueRooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };
    fetchAllRooms();
  }, []);

  const generateHeatmapData = async (selectedRoom) => {
    const startDate = new Date().toISOString()
    const endDatePre = new Date();
    endDatePre.setDate(endDatePre.getDate() + 6);
    const endDate = endDatePre.toISOString();
    
    if (!selectedRoom) return;
    try {
      const response = await axios.get("http://localhost:5005/api/rooms");
      const roomData = response.data.filter((room) => room.FacilityName === selectedRoom  &&
      room.Time >= startDate && 
      room.Time <= endDate);
      const formattedData = roomData
        .map((room) => {
          if (!room.Time) return null;
          return {
            Time: room.Time,
            Count: room.Count,
          };
        })
        .filter(Boolean);
      setRooms(roomData);
      setHeatmapData(formattedData);
      console.log(formattedData);
    } catch (error) {
      console.error("Error fetching room data:", error);
    }
  };

  const handleRoomSelection = () => {
    generateHeatmapData(selectedRoom);
  };

  return (
    <div className="p-4">
      <h1 className="text-center text-2xl font-bold mb-6">Room Utilization</h1>

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

      {heatmapData.length > 0 && (
        <div className="mt-8" style={{ width: "700px", height: "500px", margin: "0 auto" }}>
          <HeatMap data={heatmapData} />
        </div>
      )}
    </div>
  );
};

export default RoomWeekly;
