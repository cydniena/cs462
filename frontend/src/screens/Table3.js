import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RoomUtilizationDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('hour');
  const [selectedDate, setSelectedDate] = useState('2025-01-17');
  const [selectedHour, setSelectedHour] = useState(9);
  const [utilizationData, setUtilizationData] = useState([]);
  const [opportunityData, setOpportunityData] = useState([]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsResponse, roomsResponse] = await Promise.all([
          fetch('http://localhost:5005/api/bookings'),
          fetch('http://localhost:5005/api/rooms')
        ]);
        
        if (!bookingsResponse.ok || !roomsResponse.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const bookingsData = await bookingsResponse.json();
        const roomsData = await roomsResponse.json();
        
        setBookings(bookingsData);
        setRooms(roomsData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Helper function to extract building and floor from FacilityName
  const getBuildingAndFloor = (facilityName) => {
    if (!facilityName) return { 
      building: 'Unknown', 
      shortBuilding: 'Unknown',
      floor: 'Unknown' 
    };
    
    let building, shortBuilding, floor;
    
    if (facilityName.includes('SCIS1')) {
      building = 'School of Computing & Information Systems 1';
      shortBuilding = 'SCIS1';
    } else if (facilityName.includes('SOE/SCIS2')) {
      building = 'School of Economics/School of Computing & Information Systems 2';
      shortBuilding = 'SOE/SCIS2';
    } else {
      building = 'Unknown Building';
      shortBuilding = 'Unknown';
    }
    
    const levelMatch = facilityName.match(/(\d+)-\d+$/);
    floor = levelMatch && levelMatch[1] ? `Level ${levelMatch[1]}` : 'Unknown Floor';
    
    return { building, shortBuilding, floor };
  };

  // Recalculate when filters or data change
  useEffect(() => {
    if (bookings.length > 0 && rooms.length > 0) {
      calculateUtilization();
      calculateOpportunities();
    }
  }, [bookings, rooms, timeFilter, selectedDate, selectedHour]);

  const isRoomBooked = (facilityName, time) => {
    const roomBookings = bookings.filter(booking => 
      booking.FacilityName === facilityName && 
      booking.BookingStatus === 'Confirmed'
    );
    
    const timeDate = new Date(time);
    
    for (const booking of roomBookings) {
      const startTime = new Date(booking.BookingStartTime);
      const endTime = new Date(booking.BookingEndTime);
      
      if (timeDate >= startTime && timeDate < endTime) {
        return 'booked';
      }
    }
    
    return 'unbooked';
  };

  const calculateUtilization = () => {
    const buildingFloorGroups = {};
    
    rooms.forEach(room => {
      const { building, shortBuilding, floor } = getBuildingAndFloor(room.FacilityName);
      const key = `${building}|${floor}`;
      
      if (!buildingFloorGroups[key]) {
        buildingFloorGroups[key] = {
          building,
          shortBuilding,
          floor,
          rooms: new Set(),
          unbookedUtilizedRooms: [],
          bookedUnutilizedRooms: []
        };
      }
      
      if (room.FacilityName) {
        buildingFloorGroups[key].rooms.add(room.FacilityName);
      }
    });

    bookings.forEach(booking => {
      const { building, shortBuilding, floor } = booking.FacilityName 
        ? getBuildingAndFloor(booking.FacilityName)
        : { 
            building: booking.Building || 'Unknown', 
            shortBuilding: 'Unknown',
            floor: booking.Floor || 'Unknown' 
          };
      
      const key = `${building}|${floor}`;
      
      if (!buildingFloorGroups[key]) {
        buildingFloorGroups[key] = {
          building,
          shortBuilding,
          floor,
          rooms: new Set(),
          unbookedUtilizedRooms: [],
          bookedUnutilizedRooms: []
        };
      }
      
      if (booking.FacilityName) {
        buildingFloorGroups[key].rooms.add(booking.FacilityName);
      }
    });

    const results = [];
    
    Object.values(buildingFloorGroups).forEach(group => {
      const roomNames = Array.from(group.rooms);
      let totalRooms = 0;
      let unbookedUtilizedCount = 0;
      let bookedUnutilizedCount = 0;
      const unbookedUtilizedRooms = [];
      const bookedUnutilizedRooms = [];
      
      if (timeFilter === 'hour') {
        const targetTime = new Date(`${selectedDate}T${String(selectedHour).padStart(2, '0')}:00:00`);
        
        roomNames.forEach(roomName => {
          const roomData = rooms.find(room => 
            room.FacilityName === roomName && 
            new Date(room.Time).toISOString().slice(0, 16) === targetTime.toISOString().slice(0, 16)
          );
          
          if (roomData) {
            totalRooms++;
            const bookedStatus = isRoomBooked(roomName, roomData.Time);
            
            if (bookedStatus === 'unbooked' && roomData.Count > 0) {
              unbookedUtilizedCount++;
              unbookedUtilizedRooms.push({
                name: roomName.replace(`${group.building} `, ''),
                count: roomData.Count,
                capacity: roomData.Capacity
              });
            } else if (bookedStatus === 'booked' && roomData.Count === 0) {
              bookedUnutilizedCount++;
              bookedUnutilizedRooms.push({
                name: roomName.replace(`${group.building} `, ''),
                capacity: roomData.Capacity
              });
            }
          }
        });
      } else if (timeFilter === 'day') {
        const targetDate = new Date(selectedDate);
        targetDate.setHours(0, 0, 0, 0);
        const nextDate = new Date(targetDate);
        nextDate.setDate(targetDate.getDate() + 1);
        
        roomNames.forEach(roomName => {
          const roomDataForDay = rooms.filter(room => 
            room.FacilityName === roomName && 
            new Date(room.Time) >= targetDate && 
            new Date(room.Time) < nextDate
          );
          
          if (roomDataForDay.length > 0) {
            totalRooms++;
            
            let hasUnbookedUtilized = false;
            let hasBookedUnutilized = false;
            
            roomDataForDay.forEach(roomData => {
              const bookedStatus = isRoomBooked(roomName, roomData.Time);
              
              if (bookedStatus === 'unbooked' && roomData.Count > 0) {
                hasUnbookedUtilized = true;
              } else if (bookedStatus === 'booked' && roomData.Count === 0) {
                hasBookedUnutilized = true;
              }
            });
            
            if (hasUnbookedUtilized) {
              unbookedUtilizedCount++;
              unbookedUtilizedRooms.push({
                name: roomName.replace(`${group.building} `, ''),
                count: 'Various',
                capacity: roomDataForDay[0].Capacity
              });
            }
            
            if (hasBookedUnutilized) {
              bookedUnutilizedCount++;
              bookedUnutilizedRooms.push({
                name: roomName.replace(`${group.building} `, ''),
                capacity: roomDataForDay[0].Capacity
              });
            }
          }
        });
      } else if (timeFilter === 'week') {
        const targetDate = new Date(selectedDate);
        targetDate.setHours(0, 0, 0, 0);
        const dayOfWeek = targetDate.getDay();
        const startOfWeek = new Date(targetDate);
        startOfWeek.setDate(targetDate.getDate() - dayOfWeek);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        
        roomNames.forEach(roomName => {
          const roomDataForWeek = rooms.filter(room => 
            room.FacilityName === roomName && 
            new Date(room.Time) >= startOfWeek && 
            new Date(room.Time) < endOfWeek
          );
          
          if (roomDataForWeek.length > 0) {
            totalRooms++;
            
            let hasUnbookedUtilized = false;
            let hasBookedUnutilized = false;
            
            roomDataForWeek.forEach(roomData => {
              const bookedStatus = isRoomBooked(roomName, roomData.Time);
              
              if (bookedStatus === 'unbooked' && roomData.Count > 0) {
                hasUnbookedUtilized = true;
              } else if (bookedStatus === 'booked' && roomData.Count === 0) {
                hasBookedUnutilized = true;
              }
            });
            
            if (hasUnbookedUtilized) {
              unbookedUtilizedCount++;
              unbookedUtilizedRooms.push({
                name: roomName.replace(`${group.building} `, ''),
                count: 'Various',
                capacity: roomDataForWeek[0].Capacity
              });
            }
            
            if (hasBookedUnutilized) {
              bookedUnutilizedCount++;
              bookedUnutilizedRooms.push({
                name: roomName.replace(`${group.building} `, ''),
                capacity: roomDataForWeek[0].Capacity
              });
            }
          }
        });
      }
      
      if (totalRooms > 0) {
        const unbookedUtilizedPercentage = (unbookedUtilizedCount / totalRooms) * 100;
        const bookedUnutilizedPercentage = (bookedUnutilizedCount / totalRooms) * 100;
        
        results.push({
          building: group.building,
          shortBuilding: group.shortBuilding,
          floor: group.floor,
          totalRooms,
          unbookedUtilizedCount,
          bookedUnutilizedCount,
          unbookedUtilizedPercentage: unbookedUtilizedPercentage.toFixed(2),
          bookedUnutilizedPercentage: bookedUnutilizedPercentage.toFixed(2),
          unbookedUtilizedRooms,
          bookedUnutilizedRooms
        });
      }
    });

    const sortedResults = results.sort((a, b) => {
      if (a.building < b.building) return -1;
      if (a.building > b.building) return 1;
      if (a.floor < b.floor) return -1;
      if (a.floor > b.floor) return 1;
      return 0;
    });
    
    setUtilizationData(sortedResults);
  };

  const calculateOpportunities = () => {
    const buildingFloorGroups = {};
    
    rooms.forEach(room => {
      const { building, shortBuilding, floor } = getBuildingAndFloor(room.FacilityName);
      const key = `${building}|${floor}`;
      
      if (!buildingFloorGroups[key]) {
        buildingFloorGroups[key] = {
          building,
          shortBuilding,
          floor,
          rooms: new Set(),
          opportunityRooms: []
        };
      }
      
      if (room.FacilityName) {
        buildingFloorGroups[key].rooms.add(room.FacilityName);
      }
    });
  
    bookings.forEach(booking => {
      const { building, shortBuilding, floor } = booking.FacilityName 
        ? getBuildingAndFloor(booking.FacilityName)
        : { 
            building: booking.Building || 'Unknown', 
            shortBuilding: 'Unknown',
            floor: booking.Floor || 'Unknown' 
          };
      
      const key = `${building}|${floor}`;
      
      if (!buildingFloorGroups[key]) {
        buildingFloorGroups[key] = {
          building,
          shortBuilding,
          floor,
          rooms: new Set(),
          opportunityRooms: []
        };
      }
      
      if (booking.FacilityName) {
        buildingFloorGroups[key].rooms.add(booking.FacilityName);
      }
    });
  
    const results = [];
    
    Object.values(buildingFloorGroups).forEach(group => {
      const roomNames = Array.from(group.rooms);
      let totalRooms = 0;
      let opportunityCount = 0;
      const opportunityRoomDetails = [];
      
      if (timeFilter === 'hour') {
        const targetTime = new Date(`${selectedDate}T${String(selectedHour).padStart(2, '0')}:00:00`);
        
        roomNames.forEach(roomName => {
          const roomData = rooms.find(room => 
            room.FacilityName === roomName && 
            new Date(room.Time).toISOString().slice(0, 16) === targetTime.toISOString().slice(0, 16)
          );
          
          if (roomData) {
            totalRooms++;
            const bookedStatus = isRoomBooked(roomName, roomData.Time);
            
            if (bookedStatus === 'unbooked' && roomData.Count === 0) {
              opportunityCount++;
              opportunityRoomDetails.push({
                name: roomName.replace(`${group.building} `, ''),
                capacity: roomData.Capacity
              });
            }
          }
        });
      } else if (timeFilter === 'day') {
        const targetDate = new Date(selectedDate);
        targetDate.setHours(0, 0, 0, 0);
        const nextDate = new Date(targetDate);
        nextDate.setDate(targetDate.getDate() + 1);
        
        roomNames.forEach(roomName => {
          const roomDataForDay = rooms.filter(room => 
            room.FacilityName === roomName && 
            new Date(room.Time) >= targetDate && 
            new Date(room.Time) < nextDate
          );
          
          if (roomDataForDay.length > 0) {
            totalRooms++;
            
            const wasOpportunity = roomDataForDay.some(roomData => {
              const bookedStatus = isRoomBooked(roomName, roomData.Time);
              return bookedStatus === 'unbooked' && roomData.Count === 0;
            });
            
            if (wasOpportunity) {
              opportunityCount++;
              opportunityRoomDetails.push({
                name: roomName.replace(`${group.building} `, ''),
                capacity: roomDataForDay[0].Capacity
              });
            }
          }
        });
      } else if (timeFilter === 'week') {
        const targetDate = new Date(selectedDate);
        targetDate.setHours(0, 0, 0, 0);
        const dayOfWeek = targetDate.getDay();
        const startOfWeek = new Date(targetDate);
        startOfWeek.setDate(targetDate.getDate() - dayOfWeek);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        
        roomNames.forEach(roomName => {
          const roomDataForWeek = rooms.filter(room => 
            room.FacilityName === roomName && 
            new Date(room.Time) >= startOfWeek && 
            new Date(room.Time) < endOfWeek
          );
          
          if (roomDataForWeek.length > 0) {
            totalRooms++;
            
            const wasOpportunity = roomDataForWeek.some(roomData => {
              const bookedStatus = isRoomBooked(roomName, roomData.Time);
              return bookedStatus === 'unbooked' && roomData.Count === 0;
            });
            
            if (wasOpportunity) {
              opportunityCount++;
              opportunityRoomDetails.push({
                name: roomName.replace(`${group.building} `, ''),
                capacity: roomDataForWeek[0].Capacity
              });
            }
          }
        });
      }
      
      if (totalRooms > 0) {
        const percentage = (opportunityCount / totalRooms) * 100;
        results.push({
          building: group.building,
          shortBuilding: group.shortBuilding,
          floor: group.floor,
          totalRooms,
          opportunityCount,
          opportunityPercentage: percentage.toFixed(2),
          opportunityRoomDetails
        });
      }
    });
  
    const sortedResults = results.sort((a, b) => {
      if (a.building < b.building) return -1;
      if (a.building > b.building) return 1;
      if (a.floor < b.floor) return -1;
      if (a.floor > b.floor) return 1;
      return 0;
    });
    
    setOpportunityData(sortedResults);
  };

  if (loading) return <div>Loading data...</div>;
  if (error) return <div>Error: {error}</div>;

  const mergedTableData = utilizationData.map(utilItem => {
    const oppItem = opportunityData.find(item => 
      item.building === utilItem.building && item.floor === utilItem.floor
    ) || {};
    
    return {
      ...utilItem,
      opportunityCount: oppItem.opportunityCount || 0,
      opportunityPercentage: oppItem.opportunityPercentage || '0.00',
      opportunityRoomDetails: oppItem.opportunityRoomDetails || []
    };
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Room Utilization Dashboard</h2>
      
      <div style={{ 
        marginBottom: '20px', 
        display: 'flex', 
        gap: '20px', 
        alignItems: 'center', 
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <label htmlFor="timeFilter">Time Filter:</label>
          <select 
            id="timeFilter" 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            style={{ padding: '5px' }}
          >
            <option value="hour">By Hour</option>
            <option value="day">By Day</option>
            <option value="week">By Week</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <label htmlFor="datePicker">Date:</label>
          <input 
            type="date" 
            id="datePicker"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '5px' }}
          />
        </div>
        
        {timeFilter === 'hour' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <label htmlFor="hourPicker">Hour:</label>
            <select
              id="hourPicker"
              value={selectedHour}
              onChange={(e) => setSelectedHour(parseInt(e.target.value))}
              style={{ padding: '5px' }}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{i}:00</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {utilizationData.length > 0 && opportunityData.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div style={{ height: '400px' }}>
              <h3>Not Booked but Utilized Rooms</h3>
              <Bar
                data={{
                  labels: utilizationData.map(item => `${item.shortBuilding} - ${item.floor}`),
                  datasets: [
                    {
                      label: '% Not Booked but Utilized',
                      data: utilizationData.map(item => parseFloat(item.unbookedUtilizedPercentage)),
                      backgroundColor: 'rgba(54, 162, 235, 0.6)',
                      borderColor: 'rgba(54, 162, 235, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      title: {
                        display: true,
                        text: 'Percentage (%)'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Building and Floor'
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        title: function(context) {
                          const data = utilizationData[context.dataIndex];
                          return `${data.building} - ${data.floor}`;
                        },
                        afterLabel: function(context) {
                          const data = utilizationData[context.dataIndex];
                          if (!data || !data.unbookedUtilizedCount) {
                            return 'All rooms are properly booked or unutilized';
                          }
                          
                          const roomDetails = data.unbookedUtilizedRooms?.map(room => {
                            return timeFilter === 'hour' 
                              ? `• ${room.name}: ${room.count}/${room.capacity} people`
                              : `• ${room.name} (usage varies)`;
                          }) || [];
                          
                          return [
                            `Unbooked but Utilized Rooms (${data.unbookedUtilizedCount}/${data.totalRooms}):`,
                            ...roomDetails
                          ].join('\n');
                        }
                      }
                    }
                  }
                }}
              />
            </div>

            <div style={{ height: '400px' }}>
              <h3>Booked but Unutilized Rooms</h3>
              <Bar
                data={{
                  labels: utilizationData.map(item => `${item.shortBuilding} - ${item.floor}`),
                  datasets: [
                    {
                      label: '% Booked but Unutilized',
                      data: utilizationData.map(item => parseFloat(item.bookedUnutilizedPercentage)),
                      backgroundColor: 'rgba(255, 99, 132, 0.6)',
                      borderColor: 'rgba(255, 99, 132, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      title: {
                        display: true,
                        text: 'Percentage (%)'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Building and Floor'
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        title: function(context) {
                          const data = utilizationData[context.dataIndex];
                          return `${data.building} - ${data.floor}`;
                        },
                        afterLabel: function(context) {
                          const data = utilizationData[context.dataIndex];
                          if (!data || !data.bookedUnutilizedCount) {
                            return 'No booked but unutilized rooms';
                          }
                          
                          const roomDetails = data.bookedUnutilizedRooms?.map(room => {
                            return `• ${room.name} (0/${room.capacity} people)`;
                          }) || [];
                          
                          return [
                            `Booked but Unutilized Rooms (${data.bookedUnutilizedCount}/${data.totalRooms}):`,
                            ...roomDetails
                          ].join('\n');
                        }
                      }
                    }
                  }
                }}
              />
            </div>

            <div style={{ height: '400px' }}>
              <h3>Not Booked and Unutilized Rooms</h3>
              <Bar
                data={{
                  labels: opportunityData.map(item => `${item.shortBuilding} - ${item.floor}`),
                  datasets: [
                    {
                      label: '% Not Booked and Unutilized',
                      data: opportunityData.map(item => parseFloat(item.opportunityPercentage)),
                      backgroundColor: 'rgba(75, 192, 192, 0.6)',
                      borderColor: 'rgba(75, 192, 192, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      title: {
                        display: true,
                        text: 'Percentage (%)'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Building and Floor'
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        title: function(context) {
                          const data = opportunityData[context.dataIndex];
                          return data ? `${data.building} - ${data.floor}` : 'Building - Floor';
                        },
                        afterLabel: function(context) {
                          const data = opportunityData[context.dataIndex];
                          if (!data || !data.opportunityCount) {
                            return 'No unbooked and unutilized rooms';
                          }
                          
                          const roomDetails = data.opportunityRoomDetails?.map(room => {
                            return `• ${room.name} (0/${room.capacity} people)`;
                          }) || [];
                          
                          return [
                            `Unbooked and Unutilized Rooms (${data.opportunityCount}/${data.totalRooms}):`,
                            ...roomDetails
                          ].join('\n');
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto', marginTop: '50px' }}>
            <h3>Comprehensive Room Utilization Data</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Building</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Floor</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Total Rooms</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Unbooked & Utilized</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>%</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Booked & Unutilized</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>%</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Not Booked & Unutilized</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>%</th>
                </tr>
              </thead>
              <tbody>
                {mergedTableData.map((data, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px', textAlign: 'left' }}>{data.building}</td>
                    <td style={{ padding: '12px', textAlign: 'left' }}>{data.floor}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{data.totalRooms}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{data.unbookedUtilizedCount}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{data.unbookedUtilizedPercentage}%</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{data.bookedUnutilizedCount}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{data.bookedUnutilizedPercentage}%</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{data.opportunityCount}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{data.opportunityPercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default RoomUtilizationDashboard;