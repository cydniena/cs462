import React, { useState, useEffect } from "react";
import axios from "axios";
import "./css/data.css";
import GridTable2 from "../components/RoomVisualisation";
import SideNav from "../components/SideNav";
import { useLocation, useNavigate } from 'react-router-dom';
import { FaHome } from "react-icons/fa"; // Importing the Home icon from react-icons

function RoomDetail() {
  const [utilizationData, setUtilizationData] = useState([]);
  const [filteredUtilizationData, setFilteredUtilizationData] = useState([]);
  const [bookingsData, setBookingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const location = useLocation();
  const navigate = useNavigate(); // Hook for navigation
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
    toggleSidebar();
  };

  const handleHomeClick = () => {
    navigate("/"); // Navigate to the landing page
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="page-container">
      {/* Hamburger Icon and Home Icon Container */}
      <div style={{ position: 'fixed', left: '20px', top: '20px', zIndex: 1000 }}>
        {/* Hamburger Icon */}
        <div className="hamburger-icon" onClick={toggleSidebar}>
          <div className={`bar ${sidebarOpen ? "change" : ""}`}></div>
          <div className={`bar ${sidebarOpen ? "change" : ""}`}></div>
          <div className={`bar ${sidebarOpen ? "change" : ""}`}></div>
        </div>
        
        {/* Home Icon */}
        <div 
          style={{
            marginTop: '40px',
            cursor: 'pointer',
            color: '#333',
            fontSize: '30px',
            textAlign: 'center'
          }}
          onClick={handleHomeClick}
          title="Return to Home"
        >
          <FaHome />
        </div>
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