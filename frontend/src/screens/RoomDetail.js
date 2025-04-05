import React, { useState, useEffect } from "react";
import axios from "axios";
import "./css/data.css";
import GridTable2 from "../components/GridTable2";
import SideNav from "../components/SideNav";
import { useLocation } from 'react-router-dom';

function RoomDetail() {
  const [utilizationData, setUtilizationData] = useState([]);
  const [filteredUtilizationData, setFilteredUtilizationData] = useState([]);
  const [bookingsData, setBookingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const room = queryParams.get('room');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsResponse, bookingsResponse] = await Promise.all([
          fetch("http://localhost:5005/api/rooms"),
          fetch("http://localhost:5005/api/bookings"),
        ]);

        if (!roomsResponse.ok || !bookingsResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const rooms = await roomsResponse.json();
        const bookings = await bookingsResponse.json();

        setUtilizationData(rooms);
        setBookingsData(bookings);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleBuildingSelect = (building) => {
    setSelectedBuilding(building);
    //filterByBuilding(building);
    toggleSidebar();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="page-container">
      {/* Hamburger Icon */}
      <div className="hamburger-icon" onClick={toggleSidebar}>
        <div className={`bar ${sidebarOpen ? "change" : ""}`}></div>
        <div className={`bar ${sidebarOpen ? "change" : ""}`}></div>
        <div className={`bar ${sidebarOpen ? "change" : ""}`}></div>
      </div>

      {/* SideNav Component with building selection handler */}
      <SideNav
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        onBuildingSelect={handleBuildingSelect}
      />

      {/* Main Content */}
      <div className="main-content">
        <GridTable2
          utilizationData={utilizationData}
          bookingsData={bookingsData}
          selectedRoom={room}
        />
      </div>
    </div>
  );
}

export default RoomDetail;
