import React, { useState, useEffect } from 'react';
import '../screens/css/SideNav.css';
import GridTable from '../components/GridTable';
import SideNav from '../components/SideNav';

const SpaceUtilisationSummary = () => {
  const [utilizationData, setUtilizationData] = useState([]);
  const [filteredUtilizationData, setFilteredUtilizationData] = useState([]);
  const [roomsData, setRoomsData] = useState([]);
  const [bookingsData, setBookingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsResponse, bookingsResponse] = await Promise.all([
          fetch('http://localhost:5005/api/rooms'),
          fetch('http://localhost:5005/api/bookings')
        ]);

        if (!roomsResponse.ok || !bookingsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const rooms = await roomsResponse.json();
        const bookings = await bookingsResponse.json();

        setRoomsData(rooms);
        setBookingsData(bookings);
        const processedData = processUtilizationData(rooms, bookings);
        setUtilizationData(processedData);
        setFilteredUtilizationData(processedData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to filter data by building
  const filterByBuilding = (building) => {
    setSelectedBuilding(building);
    
    if (!building) {
      setFilteredUtilizationData(utilizationData);
      return;
    }

    // Determine the building name mapping
    const buildingMapping = {
      'SCIS1': 'School of Computing & Information Systems 1',
      'SOE/SCIS2': 'School of Economics/School of Computing & Information Systems 2'
    };

    const buildingName = buildingMapping[building];
    
    // Filter rooms that belong to the selected building
    const filteredRooms = roomsData.filter(room => {
      return room.FacilityName.includes(building);
    });

    // Filter bookings that belong to the selected building
    const filteredBookings = bookingsData.filter(booking => {
      return booking.Building === buildingName && 
             booking.BookingStatus === 'Confirmed';
    });

    // Process only the filtered data
    const filteredData = processUtilizationData(filteredRooms, filteredBookings);
    setFilteredUtilizationData(filteredData);
  };

  // Modified processUtilizationData function
  const processUtilizationData = (roomsToProcess, bookingsToProcess) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const hours = Array.from({ length: 15 }, (_, i) => 8 + i);
    
    const confirmedBookings = bookingsToProcess.filter(booking => 
      booking.BookingStatus === 'Confirmed'
    );

    const utilizationMap = {};
    
    days.forEach(day => {
      utilizationMap[day] = {};
      hours.forEach(hour => {
        utilizationMap[day][hour] = {
          totalCount: 0,
          totalCapacity: 0,
          utilization: 0
        };
      });
    });

    roomsToProcess.forEach(room => {
      const date = new Date(room.Time);
      const day = days[date.getDay()];
      const hour = date.getHours();
      
      if (utilizationMap[day] && utilizationMap[day][hour]) {
        utilizationMap[day][hour].totalCount += room.Count;
        utilizationMap[day][hour].totalCapacity += room.Capacity;
      }
    });

    confirmedBookings.forEach(booking => {
      const startDate = new Date(booking.BookingStartTime);
      const endDate = new Date(booking.BookingEndTime);
      const day = days[startDate.getDay()];
      
      const startHour = startDate.getHours();
      const endHour = endDate.getHours();
      
      const room = roomsToProcess.find(r => r.FacilityName === booking.FacilityName);
      const capacity = room ? room.Capacity : 50;
      
      for (let hour = startHour; hour <= endHour; hour++) {
        if (utilizationMap[day] && utilizationMap[day][hour]) {
          utilizationMap[day][hour].totalCount += capacity;
          utilizationMap[day][hour].totalCapacity += capacity;
        }
      }
    });

    days.forEach(day => {
      hours.forEach(hour => {
        const data = utilizationMap[day][hour];
        if (data.totalCapacity > 0) {
          data.utilization = Math.round((data.totalCount / data.totalCapacity) * 100);
        }
      });
    });

    return utilizationMap;
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleBuildingSelect = (building) => {
    setSelectedBuilding(building);
    filterByBuilding(building);
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
        <GridTable
          utilizationData={filteredUtilizationData} 
          roomsData={selectedBuilding ? 
            roomsData.filter(room => room.FacilityName.includes(selectedBuilding)) : 
            roomsData} 
            selectedBuilding={selectedBuilding} 
        />
      </div>
      
    </div>
  );
};

export default SpaceUtilisationSummary;

