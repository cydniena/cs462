import React, { useState, useEffect } from 'react';
import './css/summary.css';

const SpaceUtilisationSummary = () => {
  const [utilizationData, setUtilizationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        const roomsData = await roomsResponse.json();
        const bookingsData = await bookingsResponse.json();

        // Process the data to calculate utilization
        const processedData = processUtilizationData(roomsData, bookingsData);
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
    // Group data by day of week and hour
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const hours = Array.from({ length: 15 }, (_, i) => 8 + i); // 8am to 10pm
    
    // Filter only confirmed bookings
    const confirmedBookings = bookingsData.filter(booking => 
      booking.BookingStatus === 'Confirmed'
    );

    // Create a map for utilization data
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

    // Process rooms data
    roomsData.forEach(room => {
      const date = new Date(room.Time);
      const day = days[date.getDay()];
      const hour = date.getHours();
      
      if (utilizationMap[day] && utilizationMap[day][hour]) {
        utilizationMap[day][hour].totalCount += room.Count;
        utilizationMap[day][hour].totalCapacity += room.Capacity;
      }
    });

    // Process bookings data (to account for future bookings)
    confirmedBookings.forEach(booking => {
      const startDate = new Date(booking.BookingStartTime);
      const endDate = new Date(booking.BookingEndTime);
      const day = days[startDate.getDay()];
      
      // Get all hours this booking spans
      const startHour = startDate.getHours();
      const endHour = endDate.getHours();
      
      // Find the room's capacity
      const room = roomsData.find(r => r.FacilityName === booking.FacilityName);
      const capacity = room ? room.Capacity : 50; // default to 50 if not found
      
      for (let hour = startHour; hour <= endHour; hour++) {
        if (utilizationMap[day] && utilizationMap[day][hour]) {
          // For bookings, we'll assume full capacity utilization
          utilizationMap[day][hour].totalCount += capacity;
          utilizationMap[day][hour].totalCapacity += capacity;
        }
      }
    });

    // Calculate utilization percentages
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

  // Function to determine cell color based on utilization percentage
  const getCellColor = (percentage) => {
    if (percentage >= 80) return 'high-utilization'; // red
    if (percentage >= 60) return 'medium-utilization'; // yellow
    return 'low-utilization'; // green
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = Array.from({ length: 15 }, (_, i) => 8 + i); // 8am to 10pm

  return (
    <div className="utilization-container">
      <h1>Space Utilization Summary</h1>
      <div className="utilization-grid">
        {/* Header row with hours */}
        <div className="grid-row header">
          <div className="grid-cell time-label">Time/Day</div>
          {hours.map(hour => (
            <div key={hour} className="grid-cell hour-header">
              {hour}:00
            </div>
          ))}
        </div>
        
        {/* Data rows for each day */}
        {days.map(day => (
          <div key={day} className="grid-row">
            <div className="grid-cell day-label">{day}</div>
            {hours.map(hour => {
              const data = utilizationData[day]?.[hour] || { utilization: 0 };
              return (
                <div 
                  key={`${day}-${hour}`} 
                  className={`grid-cell ${getCellColor(data.utilization)}`}
                  title={`${day} ${hour}:00 - Utilization: ${data.utilization}%`}
                >
                  {data.utilization}%
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color low-utilization"></div>
          <span>Low Utilization (0-59%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color medium-utilization"></div>
          <span>Medium Utilization (60-79%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color high-utilization"></div>
          <span>High Utilization (80-100%)</span>
        </div>
      </div>
    </div>
  );
};

export default SpaceUtilisationSummary;