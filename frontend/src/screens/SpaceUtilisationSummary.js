import React, { useState, useEffect } from 'react';
import '../screens/css/SideNav.css';
import GridTable from '../components/GridTable';
import SideNav from '../components/SideNav';

const SpaceUtilisationSummary = () => {
  const [utilizationData, setUtilizationData] = useState([]);
  const [roomsData, setRoomsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from both endpoints
        const [roomsResponse, bookingsResponse] = await Promise.all([
          fetch('http://localhost:5005/api/rooms'),
          fetch('http://localhost:5005/api/bookings')
        ]);

        if (!roomsResponse.ok || !bookingsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const rooms = await roomsResponse.json();
        const bookingsData = await bookingsResponse.json();

        setRoomsData(rooms);
        // Process the data to calculate utilization
        const processedData = processUtilizationData(rooms, bookingsData);
        setUtilizationData(processedData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to process the data and calculate utilization percentages
  const processUtilizationData = (roomsData, bookingsData) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const hours = Array.from({ length: 15 }, (_, i) => 8 + i);
    
    const confirmedBookings = bookingsData.filter(booking => 
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

    roomsData.forEach(room => {
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
      
      const room = roomsData.find(r => r.FacilityName === booking.FacilityName);
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

      {/* SideNav Component */}
      <SideNav isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="main-content">
        <GridTable
          utilizationData={utilizationData} 
          roomsData={roomsData} 
        />
      </div>
    </div>
  );
};

export default SpaceUtilisationSummary;