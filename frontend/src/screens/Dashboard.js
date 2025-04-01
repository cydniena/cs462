import React, { useState, useEffect } from "react";
import axios from "axios";
import RoomTable from "../components/RoomTable";
import RoomStats from "./RoomStats";
import BookedUtilized from "./BookedUtilized";
import FloorHeatMap from "./FloorHeatMap";
import AvgBookingUtilisation from "./AvgBookingUtilisation";
import PieChart from "../components/PieChart";
import LineChart from "../components/LineChart";

const Dashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [booking, setBooking] = useState([]);
  const [pieChartData, setPieChartData] = useState([0, 0, 0, 0]);

  // Fetch rooms data
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://localhost:5005/api/rooms");
        setRooms(response.data);
        calculatePieChartData(response.data);
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

  // Calculate data for the pie chart
  const calculatePieChartData = (rooms) => {
    let bookedUtilized = 0;
    let bookedUnutilized = 0;
    let notBookedUtilized = 0;
    let notBookedUnutilized = 0;

    rooms.forEach((room) => {
      if (room.Count > 0 && room.Capacity > 0) {
        if (room.Count === room.Capacity) {
          bookedUtilized++;
        } else {
          bookedUnutilized++;
        }
      } else if (room.Count > 0) {
        notBookedUtilized++;
      } else {
        notBookedUnutilized++;
      }
    });

    const total = rooms.length || 1; // Avoid division by zero
    setPieChartData([
      (bookedUtilized / total) * 100,
      (bookedUnutilized / total) * 100,
      (notBookedUtilized / total) * 100,
      (notBookedUnutilized / total) * 100,
    ]);
  };

  return (
    <div className="p-4">
      <h1 className="text-center text-2xl font-bold mb-6">Room Utilization</h1>
      <div className="mb-8" style={{ display: "none" }}>
        <RoomTable data={rooms} />
      </div>
      {/* <div className="mt-8">
        <RoomStats hourlyData={rooms} bookings={booking} roomName="SCIS1 Classroom 3-1" />
      </div>
      <div className="mt-8">
        <BookedUtilized occupancyData={rooms} bookings={booking} roomName="SCIS1 Classroom 3-1" />
      </div>
      <div className="mt-8">
        <FloorHeatMap occupancyData={rooms}/>
      </div> */}
      <div className="mt-8">
        <AvgBookingUtilisation occupancyData={rooms} bookings={booking} roomName="SCIS1 Classroom 3-1"/>
      </div>
      <div className="mt-8" style={{ width: "500px", height: "500px", margin: "0 auto" }}>
        <PieChart data={pieChartData} />
      </div>
      <div className="mt-8" style={{ height: "50px" }}></div>
      <div className="mt-8" style={{ width: "500px", height: "500px", margin: "0 auto" }}>
        <LineChart occupancyData={rooms} roomName="SOE/SCIS2 Seminar Room 3-1" />
      </div>
    </div>
  );
};

export default Dashboard;
