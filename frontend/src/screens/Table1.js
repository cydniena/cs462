// import React, { useState, useEffect } from 'react';
// import { Table } from 'react-bootstrap';
// import axios from 'axios';
// import { Chart } from 'chart.js/auto';

// const Table1 = () => {
//   const [bookings, setBookings] = useState([]);
//   const [rooms, setRooms] = useState([]);
//   const [timeFilter, setTimeFilter] = useState('hour');
//   const [selectedHour, setSelectedHour] = useState('09:00');
//   const [selectedDate, setSelectedDate] = useState('2025-01-17');
//   const [selectedWeek, setSelectedWeek] = useState('2025-W03');
//   const [utilizationData, setUtilizationData] = useState([]);
//   const [chartInstance, setChartInstance] = useState(null);

//   // Helper function to extract building and floor from FacilityName
//   const getBuildingAndFloor = (facilityName) => {
//     if (!facilityName) return { building: 'Unknown', floor: 'Unknown' };
    
//     let building, floor;
    
//     // Determine building
//     if (facilityName.includes('SCIS1')) {
//       building = 'School of Computing & Information Systems 1';
//     } else if (facilityName.includes('SOE/SCIS2')) {
//       building = 'School of Economics/School of Computing & Information Systems 2';
//     } else {
//       building = 'Unknown Building';
//     }
    
//     // Determine floor level from pattern like "3-1" or "4-2"
//     const levelMatch = facilityName.match(/(\d+)-\d+$/);
//     if (levelMatch && levelMatch[1]) {
//       floor = `Level ${levelMatch[1]}`;
//     } else {
//       floor = 'Unknown Floor';
//     }
    
//     return { building, floor };
//   };

//   // Fetch data from API
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [bookingsRes, roomsRes] = await Promise.all([
//           axios.get('http://localhost:5005/api/bookings'),
//           axios.get('http://localhost:5005/api/rooms')
//         ]);
//         setBookings(bookingsRes.data);
//         setRooms(roomsRes.data);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     };
//     fetchData();
//   }, []);

//   // Calculate utilization data
//   useEffect(() => {
//     if (bookings.length === 0 || rooms.length === 0) return;

//     const calculateUtilization = () => {
//       const results = [];
      
//       // First create a map of all unique rooms with their building and floor
//       const roomInfoMap = {};
      
//       // Process bookings first
//       bookings.forEach(booking => {
//         const { building, floor } = booking.FacilityName 
//           ? getBuildingAndFloor(booking.FacilityName)
//           : { building: booking.Building || 'Unknown', floor: booking.Floor || 'Unknown' };
        
//         if (!roomInfoMap[booking.FacilityName]) {
//           roomInfoMap[booking.FacilityName] = { building, floor };
//         }
//       });
      
//       // Then process rooms to catch any that might not have bookings
//       rooms.forEach(room => {
//         if (!roomInfoMap[room.FacilityName]) {
//           const { building, floor } = getBuildingAndFloor(room.FacilityName);
//           roomInfoMap[room.FacilityName] = { building, floor };
//         }
//       });
      
//       // Now group by building and floor
//       const buildingFloorGroups = {};
      
//       Object.entries(roomInfoMap).forEach(([facilityName, { building, floor }]) => {
//         const key = `${building}|${floor}`;
//         if (!buildingFloorGroups[key]) {
//           buildingFloorGroups[key] = {
//             building,
//             floor,
//             rooms: new Set()
//           };
//         }
//         buildingFloorGroups[key].rooms.add(facilityName);
//       });
      
//       // Now calculate utilization for each building/floor group
//       Object.values(buildingFloorGroups).forEach(group => {
//         const roomNames = Array.from(group.rooms);
//         let totalRooms = 0;
//         let unutilizedBookedRooms = 0;

//         if (timeFilter === 'hour') {
//           const dateTime = `${selectedDate}T${selectedHour}:00`;
//           const hourDate = new Date(dateTime);

//           totalRooms = roomNames.length;

//           roomNames.forEach(roomName => {
//             // Find if room is booked at this time
//             const isBooked = bookings.some(b => {
//               if (b.FacilityName !== roomName) return false;
//               if (b.BookingStatus !== 'Confirmed') return false;
              
//               const start = new Date(b.BookingStartTime);
//               const end = new Date(b.BookingEndTime);
//               return hourDate >= start && hourDate < end;
//             });

//             if (isBooked) {
//               // Find room count data
//               const roomData = rooms.find(
//                 r => r.FacilityName === roomName && r.Time === dateTime
//               );
              
//               if (!roomData || roomData.Count === 0) {
//                 unutilizedBookedRooms++;
//               }
//             }
//           });
//         } else if (timeFilter === 'day') {
//           const dayDate = new Date(selectedDate);
//           dayDate.setHours(0, 0, 0, 0);
//           const nextDay = new Date(dayDate);
//           nextDay.setDate(dayDate.getDate() + 1);

//           totalRooms = roomNames.length;

//           roomNames.forEach(roomName => {
//             // Find all bookings for this room on this day
//             const roomBookings = bookings.filter(b => {
//               if (b.FacilityName !== roomName) return false;
//               if (b.BookingStatus !== 'Confirmed') return false;
              
//               const start = new Date(b.BookingStartTime);
//               const end = new Date(b.BookingEndTime);
//               return (start >= dayDate && start < nextDay) || 
//                      (end > dayDate && end <= nextDay) ||
//                      (start <= dayDate && end >= nextDay);
//             });

//             if (roomBookings.length > 0) {
//               // For day view, we'll consider a room unutilized if it has any hour with count=0 while booked
//               const roomDataForDay = rooms.filter(
//                 r => r.FacilityName === roomName && 
//                      new Date(r.Time) >= dayDate && 
//                      new Date(r.Time) < nextDay
//               );

//               const hasUnutilizedHour = roomDataForDay.some(data => {
//                 // Check if this hour is within any booking period
//                 const dataTime = new Date(data.Time);
//                 const isBookedThisHour = roomBookings.some(b => {
//                   const start = new Date(b.BookingStartTime);
//                   const end = new Date(b.BookingEndTime);
//                   return dataTime >= start && dataTime < end;
//                 });
//                 return isBookedThisHour && data.Count === 0;
//               });

//               if (hasUnutilizedHour) {
//                 unutilizedBookedRooms++;
//               }
//             }
//           });
//         } else if (timeFilter === 'week') {
//           // Calculate week start and end (simplified)
//           const weekStart = new Date(selectedWeek + '-1'); // ISO week format
//           const weekEnd = new Date(weekStart);
//           weekEnd.setDate(weekStart.getDate() + 7);

//           totalRooms = roomNames.length;

//           roomNames.forEach(roomName => {
//             // Find all bookings for this room in this week
//             const roomBookings = bookings.filter(b => {
//               if (b.FacilityName !== roomName) return false;
//               if (b.BookingStatus !== 'Confirmed') return false;
              
//               const start = new Date(b.BookingStartTime);
//               const end = new Date(b.BookingEndTime);
//               return (start >= weekStart && start < weekEnd) || 
//                      (end > weekStart && end <= weekEnd) ||
//                      (start <= weekStart && end >= weekEnd);
//             });

//             if (roomBookings.length > 0) {
//               // For week view, we'll consider a room unutilized if it has any hour with count=0 while booked
//               const roomDataForWeek = rooms.filter(
//                 r => r.FacilityName === roomName && 
//                      new Date(r.Time) >= weekStart && 
//                      new Date(r.Time) < weekEnd
//               );

//               const hasUnutilizedHour = roomDataForWeek.some(data => {
//                 // Check if this hour is within any booking period
//                 const dataTime = new Date(data.Time);
//                 const isBookedThisHour = roomBookings.some(b => {
//                   const start = new Date(b.BookingStartTime);
//                   const end = new Date(b.BookingEndTime);
//                   return dataTime >= start && dataTime < end;
//                 });
//                 return isBookedThisHour && data.Count === 0;
//               });

//               if (hasUnutilizedHour) {
//                 unutilizedBookedRooms++;
//               }
//             }
//           });
//         }

//         if (totalRooms > 0) {
//           const utilizationPercentage = (unutilizedBookedRooms / totalRooms) * 100;
//           results.push({
//             building: group.building,
//             floor: group.floor,
//             totalRooms,
//             unutilizedBookedRooms,
//             utilizationPercentage: utilizationPercentage.toFixed(2)
//           });
//         }
//       });

//       // Sort results by building and floor
//       const sortedResults = results.sort((a, b) => {
//         if (a.building < b.building) return -1;
//         if (a.building > b.building) return 1;
//         if (a.floor < b.floor) return -1;
//         if (a.floor > b.floor) return 1;
//         return 0;
//       });

//       setUtilizationData(sortedResults);
//     };

//     calculateUtilization();
//   }, [bookings, rooms, timeFilter, selectedHour, selectedDate, selectedWeek]);

//   // Render chart
//   useEffect(() => {
//     if (utilizationData.length === 0 || !document.getElementById('utilizationChart')) return;

//     if (chartInstance) {
//       chartInstance.destroy();
//     }

//     const ctx = document.getElementById('utilizationChart').getContext('2d');
//     const newChartInstance = new Chart(ctx, {
//       type: 'bar',
//       data: {
//         labels: utilizationData.map(item => `${item.building} - ${item.floor}`),
//         datasets: [{
//           label: '% Unutilized Booked Rooms',
//           data: utilizationData.map(item => parseFloat(item.utilizationPercentage)),
//           backgroundColor: 'rgba(255, 99, 132, 0.7)',
//           borderColor: 'rgba(255, 99, 132, 1)',
//           borderWidth: 1
//         }]
//       },
//       options: {
//         responsive: true,
//         scales: {
//           y: {
//             beginAtZero: true,
//             max: 100,
//             title: {
//               display: true,
//               text: 'Percentage (%)'
//             }
//           },
//           x: {
//             title: {
//               display: true,
//               text: 'Building and Floor'
//             }
//           }
//         }
//       }
//     });

//     setChartInstance(newChartInstance);

//     return () => {
//       if (newChartInstance) {
//         newChartInstance.destroy();
//       }
//     };
//   }, [utilizationData]);

//   // Generate time options
//   const hourOptions = Array.from({ length: 24 }, (_, i) => {
//     const hour = i.toString().padStart(2, '0');
//     return `${hour}:00`;
//   });

//   // Generate week options (simplified)
//   const weekOptions = ['2025-W03', '2025-W04', '2025-W05'];

//   return (
//     <div className="container mt-4">
//       <h2>Room Utilization Analysis</h2>
      
//       <div className="row mb-4">
//         <div className="col-md-4">
//           <label className="form-label">Time Filter:</label>
//           <select 
//             className="form-select"
//             value={timeFilter}
//             onChange={(e) => setTimeFilter(e.target.value)}
//           >
//             <option value="hour">By Hour</option>
//             <option value="day">By Day</option>
//             <option value="week">By Week</option>
//           </select>
//         </div>

//         {timeFilter === 'hour' && (
//           <>
//             <div className="col-md-4">
//               <label className="form-label">Date:</label>
//               <input
//                 type="date"
//                 className="form-control"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//               />
//             </div>
//             <div className="col-md-4">
//               <label className="form-label">Hour:</label>
//               <select
//                 className="form-select"
//                 value={selectedHour}
//                 onChange={(e) => setSelectedHour(e.target.value)}
//               >
//                 {hourOptions.map(hour => (
//                   <option key={hour} value={hour}>{hour}</option>
//                 ))}
//               </select>
//             </div>
//           </>
//         )}

//         {timeFilter === 'day' && (
//           <div className="col-md-4">
//             <label className="form-label">Date:</label>
//             <input
//               type="date"
//               className="form-control"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//             />
//           </div>
//         )}

//         {timeFilter === 'week' && (
//           <div className="col-md-4">
//             <label className="form-label">Week:</label>
//             <select
//               className="form-select"
//               value={selectedWeek}
//               onChange={(e) => setSelectedWeek(e.target.value)}
//             >
//               {weekOptions.map(week => (
//                 <option key={week} value={week}>{week}</option>
//               ))}
//             </select>
//           </div>
//         )}
//       </div>

//       <div className="row">
//         <div className="col-md-12">
//           <div className="chart-container" style={{ height: '400px' }}>
//             <canvas id="utilizationChart"></canvas>
//           </div>
//         </div>
//       </div>

//       <div className="row mt-4">
//         <div className="col-md-12">
//           <Table striped bordered hover>
//             <thead>
//               <tr>
//                 <th>Building</th>
//                 <th>Floor</th>
//                 <th>Total Rooms</th>
//                 <th>Unutilized Booked Rooms</th>
//                 <th>% Unutilized</th>
//               </tr>
//             </thead>
//             <tbody>
//               {utilizationData.map((data, index) => (
//                 <tr key={index}>
//                   <td>{data.building}</td>
//                   <td>{data.floor}</td>
//                   <td>{data.totalRooms}</td>
//                   <td>{data.unutilizedBookedRooms}</td>
//                   <td>{data.utilizationPercentage}%</td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Table1;

import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import axios from 'axios';
import { Chart } from 'chart.js/auto';

const Table1 = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [timeFilter, setTimeFilter] = useState('hour');
  const [selectedHour, setSelectedHour] = useState('09:00');
  const [selectedDate, setSelectedDate] = useState('2025-01-17');
  const [selectedWeek, setSelectedWeek] = useState('2025-W03');
  const [utilizationData, setUtilizationData] = useState([]);
  const [chartInstance, setChartInstance] = useState(null);

  // Helper function to extract building and floor from FacilityName
  const getBuildingAndFloor = (facilityName) => {
    if (!facilityName) return { building: 'Unknown', floor: 'Unknown' };
    
    let building, floor;
    
    // Determine building
    if (facilityName.includes('SCIS1')) {
      building = 'School of Computing & Information Systems 1';
    } else if (facilityName.includes('SOE/SCIS2')) {
      building = 'School of Economics/School of Computing & Information Systems 2';
    } else {
      building = 'Unknown Building';
    }
    
    // Determine floor level from pattern like "3-1" or "4-2"
    const levelMatch = facilityName.match(/(\d+)-\d+$/);
    if (levelMatch && levelMatch[1]) {
      floor = `Level ${levelMatch[1]}`;
    } else {
      floor = 'Unknown Floor';
    }
    
    return { building, floor };
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, roomsRes] = await Promise.all([
          axios.get('http://localhost:5005/api/bookings'),
          axios.get('http://localhost:5005/api/rooms')
        ]);
        setBookings(bookingsRes.data);
        setRooms(roomsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Calculate utilization data
  useEffect(() => {
    if (bookings.length === 0 || rooms.length === 0) return;

    const calculateUtilization = () => {
      const results = [];
      
      // First create a map of all unique rooms with their building and floor
      const roomInfoMap = {};
      
      // Process bookings first
      bookings.forEach(booking => {
        const { building, floor } = booking.FacilityName 
          ? getBuildingAndFloor(booking.FacilityName)
          : { building: booking.Building || 'Unknown', floor: booking.Floor || 'Unknown' };
        
        if (!roomInfoMap[booking.FacilityName]) {
          roomInfoMap[booking.FacilityName] = { building, floor };
        }
      });
      
      // Then process rooms to catch any that might not have bookings
      rooms.forEach(room => {
        if (!roomInfoMap[room.FacilityName]) {
          const { building, floor } = getBuildingAndFloor(room.FacilityName);
          roomInfoMap[room.FacilityName] = { building, floor };
        }
      });
      
      // Now group by building and floor
      const buildingFloorGroups = {};
      
      Object.entries(roomInfoMap).forEach(([facilityName, { building, floor }]) => {
        const key = `${building}|${floor}`;
        if (!buildingFloorGroups[key]) {
          buildingFloorGroups[key] = {
            building,
            floor,
            rooms: new Set()
          };
        }
        buildingFloorGroups[key].rooms.add(facilityName);
      });
      
      // Now calculate utilization for each building/floor group
      Object.values(buildingFloorGroups).forEach(group => {
        const roomNames = Array.from(group.rooms);
        let totalRooms = 0;
        let bookedUnutilizedRooms = 0;

        if (timeFilter === 'hour') {
          const dateTime = `${selectedDate}T${selectedHour}:00`;
          const hourDate = new Date(dateTime);

          totalRooms = roomNames.length;

          roomNames.forEach(roomName => {
            // Find if room is booked at this time (Confirmed status only)
            const isBooked = bookings.some(b => {
              if (b.FacilityName !== roomName) return false;
              if (b.BookingStatus !== 'Confirmed') return false;
              
              const start = new Date(b.BookingStartTime);
              const end = new Date(b.BookingEndTime);
              return hourDate >= start && hourDate < end;
            });

            if (isBooked) {
              // Find room count data for this exact hour
              const roomData = rooms.find(
                r => r.FacilityName === roomName && r.Time === dateTime
              );
              
              // Count as booked but unutilized if count is 0 or data not found
              if (!roomData || roomData.Count === 0) {
                bookedUnutilizedRooms++;
              }
            }
          });
        } else if (timeFilter === 'day') {
          const dayDate = new Date(selectedDate);
          dayDate.setHours(0, 0, 0, 0);
          const nextDay = new Date(dayDate);
          nextDay.setDate(dayDate.getDate() + 1);

          totalRooms = roomNames.length;

          roomNames.forEach(roomName => {
            // Find all CONFIRMED bookings for this room on this day
            const roomBookings = bookings.filter(b => {
              if (b.FacilityName !== roomName) return false;
              if (b.BookingStatus !== 'Confirmed') return false;
              
              const start = new Date(b.BookingStartTime);
              const end = new Date(b.BookingEndTime);
              return (start >= dayDate && start < nextDay) || 
                     (end > dayDate && end <= nextDay) ||
                     (start <= dayDate && end >= nextDay);
            });

            if (roomBookings.length > 0) {
              // For day view, we'll consider a room booked but unutilized if it has any hour with count=0 during booked periods
              const roomDataForDay = rooms.filter(
                r => r.FacilityName === roomName && 
                     new Date(r.Time) >= dayDate && 
                     new Date(r.Time) < nextDay
              );

              const isBookedUnutilized = roomBookings.some(booking => {
                const bookingStart = new Date(booking.BookingStartTime);
                const bookingEnd = new Date(booking.BookingEndTime);
                
                // Check if there's any room data during booking period with count=0
                return roomDataForDay.some(data => {
                  const dataTime = new Date(data.Time);
                  return dataTime >= bookingStart && 
                         dataTime < bookingEnd && 
                         data.Count === 0;
                });
              });

              if (isBookedUnutilized) {
                bookedUnutilizedRooms++;
              }
            }
          });
        } else if (timeFilter === 'week') {
          // Calculate week start and end (simplified)
          const weekStart = new Date(selectedWeek + '-1'); // ISO week format
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);

          totalRooms = roomNames.length;

          roomNames.forEach(roomName => {
            // Find all CONFIRMED bookings for this room in this week
            const roomBookings = bookings.filter(b => {
              if (b.FacilityName !== roomName) return false;
              if (b.BookingStatus !== 'Confirmed') return false;
              
              const start = new Date(b.BookingStartTime);
              const end = new Date(b.BookingEndTime);
              return (start >= weekStart && start < weekEnd) || 
                     (end > weekStart && end <= weekEnd) ||
                     (start <= weekStart && end >= weekEnd);
            });

            if (roomBookings.length > 0) {
              // For week view, similar logic to day view
              const roomDataForWeek = rooms.filter(
                r => r.FacilityName === roomName && 
                     new Date(r.Time) >= weekStart && 
                     new Date(r.Time) < weekEnd
              );

              const isBookedUnutilized = roomBookings.some(booking => {
                const bookingStart = new Date(booking.BookingStartTime);
                const bookingEnd = new Date(booking.BookingEndTime);
                
                return roomDataForWeek.some(data => {
                  const dataTime = new Date(data.Time);
                  return dataTime >= bookingStart && 
                         dataTime < bookingEnd && 
                         data.Count === 0;
                });
              });

              if (isBookedUnutilized) {
                bookedUnutilizedRooms++;
              }
            }
          });
        }

        if (totalRooms > 0) {
          const utilizationPercentage = (bookedUnutilizedRooms / totalRooms) * 100;
          results.push({
            building: group.building,
            floor: group.floor,
            totalRooms,
            bookedUnutilizedRooms,
            utilizationPercentage: utilizationPercentage.toFixed(2)
          });
        }
      });

      // Sort results by building and floor
      const sortedResults = results.sort((a, b) => {
        if (a.building < b.building) return -1;
        if (a.building > b.building) return 1;
        if (a.floor < b.floor) return -1;
        if (a.floor > b.floor) return 1;
        return 0;
      });

      setUtilizationData(sortedResults);
    };

    calculateUtilization();
  }, [bookings, rooms, timeFilter, selectedHour, selectedDate, selectedWeek]);

  // Render chart
  useEffect(() => {
    if (utilizationData.length === 0 || !document.getElementById('utilizationChart')) return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    const ctx = document.getElementById('utilizationChart').getContext('2d');
    const newChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: utilizationData.map(item => `${item.building} - ${item.floor}`),
        datasets: [{
          label: '% Booked but Unutilized Rooms',
          data: utilizationData.map(item => parseFloat(item.utilizationPercentage)),
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
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
        }
      }
    });

    setChartInstance(newChartInstance);

    return () => {
      if (newChartInstance) {
        newChartInstance.destroy();
      }
    };
  }, [utilizationData]);

  // Generate time options
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  // Generate week options (simplified)
  const weekOptions = ['2025-W03', '2025-W04', '2025-W05'];

  return (
    <div className="container mt-4">
      <h2>Room Utilization Analysis</h2>
      <p className="mb-4">Percentage of rooms booked but unutilized (Count = 0)</p>
      
      <div className="row mb-4">
        <div className="col-md-4">
          <label className="form-label">Time Filter:</label>
          <select 
            className="form-select"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="hour">By Hour</option>
            <option value="day">By Day</option>
            <option value="week">By Week</option>
          </select>
        </div>

        {timeFilter === 'hour' && (
          <>
            <div className="col-md-4">
              <label className="form-label">Date:</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Hour:</label>
              <select
                className="form-select"
                value={selectedHour}
                onChange={(e) => setSelectedHour(e.target.value)}
              >
                {hourOptions.map(hour => (
                  <option key={hour} value={hour}>{hour}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {timeFilter === 'day' && (
          <div className="col-md-4">
            <label className="form-label">Date:</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        )}

        {timeFilter === 'week' && (
          <div className="col-md-4">
            <label className="form-label">Week:</label>
            <select
              className="form-select"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              {weekOptions.map(week => (
                <option key={week} value={week}>{week}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="chart-container" style={{ height: '400px' }}>
            <canvas id="utilizationChart"></canvas>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-12">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Building</th>
                <th>Floor</th>
                <th>Total Rooms</th>
                <th>Booked but Unutilized Rooms</th>
                <th>% Unutilized</th>
              </tr>
            </thead>
            <tbody>
              {utilizationData.map((data, index) => (
                <tr key={index}>
                  <td>{data.building}</td>
                  <td>{data.floor}</td>
                  <td>{data.totalRooms}</td>
                  <td>{data.bookedUnutilizedRooms}</td>
                  <td>{data.utilizationPercentage}%</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Table1;