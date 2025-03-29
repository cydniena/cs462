import React, { useState, useEffect } from "react";
import axios from "axios";
import RoomTable from "../components/RoomTable";
import RoomStats from "./RoomStats";

const Dashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [booking, setBooking] = useState([]);

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
      <div className="mb-8" style={{ display: "none" }}>
        <RoomTable data={rooms} />
      </div>
      <div className="mt-8">
        <RoomStats hourlyData={rooms} bookings={booking} roomName="SCIS1 Classroom 3-1" />
      </div>
    </div>
  );
};

export default Dashboard;
