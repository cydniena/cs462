// import React, { useState, useEffect } from 'react';
// import { Bar } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// const Table3 = () => {
//   const [bookings, setBookings] = useState([]);
//   const [rooms, setRooms] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [timeFilter, setTimeFilter] = useState('hour');
//   const [selectedDate, setSelectedDate] = useState('2025-01-17');
//   const [selectedHour, setSelectedHour] = useState(8);
//   const [utilizationData, setUtilizationData] = useState([]);

//   // Fetch data from API
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [bookingsResponse, roomsResponse] = await Promise.all([
//           fetch('http://localhost:5005/api/bookings'),
//           fetch('http://localhost:5005/api/rooms')
//         ]);
        
//         if (!bookingsResponse.ok || !roomsResponse.ok) {
//           throw new Error('Failed to fetch data');
//         }
        
//         const bookingsData = await bookingsResponse.json();
//         const roomsData = await roomsResponse.json();
        
//         setBookings(bookingsData);
//         setRooms(roomsData);
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };
    
//     fetchData();
//   }, []);

//   // Calculate utilization data when filters or data change
//   useEffect(() => {
//     if (bookings.length > 0 && rooms.length > 0) {
//       calculateOpportunities();
//     }
//   }, [bookings, rooms, timeFilter, selectedDate, selectedHour]);

//   // Function to check if a room is booked at a specific time
//   const isRoomBooked = (facilityName, time) => {
//     const roomBookings = bookings.filter(booking => 
//       booking.FacilityName === facilityName
//     );
    
//     const timeDate = new Date(time);
    
//     for (const booking of roomBookings) {
//       const startTime = new Date(booking.BookingStartTime);
//       const endTime = new Date(booking.BookingEndTime);
      
//       if (timeDate >= startTime && timeDate < endTime) {
//         // Only "Confirmed" status counts as booked
//         // "Withdrawn" and "Rejected" count as unbooked
//         return booking.BookingStatus === 'Confirmed' ? 'booked' : 'unbooked';
//       }
//     }
    
//     return 'unbooked';
//   };

//   // Calculate opportunity percentages (unbooked and unutilized rooms)
//   const calculateOpportunities = () => {
//     // Group rooms by building and floor
//     const buildingFloorGroups = {};
    
//     // First, get all unique building and floor combinations from bookings
//     bookings.forEach(booking => {
//       const key = `${booking.Building}|${booking.Floor}`;
//       if (!buildingFloorGroups[key]) {
//         buildingFloorGroups[key] = {
//           building: booking.Building,
//           floor: booking.Floor,
//           rooms: new Set()
//         };
//       }
//       buildingFloorGroups[key].rooms.add(booking.FacilityName);
//     });
    
//     const results = [];
    
//     Object.values(buildingFloorGroups).forEach(group => {
//       const roomNames = Array.from(group.rooms);
//       let totalRooms = 0;
//       let opportunityRooms = 0; // Unbooked AND Count = 0
      
//       if (timeFilter === 'hour') {
//         // Hourly filter - check specific hour
//         const targetTime = new Date(`${selectedDate}T${String(selectedHour).padStart(2, '0')}:00:00`);
        
//         roomNames.forEach(roomName => {
//           const roomData = rooms.find(room => 
//             room.FacilityName === roomName && 
//             new Date(room.Time).getTime() === targetTime.getTime()
//           );
          
//           if (roomData) {
//             totalRooms++;
//             const bookedStatus = isRoomBooked(roomName, roomData.Time);
            
//             if (bookedStatus === 'unbooked' && roomData.Count === 0) {
//               opportunityRooms++;
//             }
//           }
//         });
//       } else if (timeFilter === 'day') {
//         // Daily filter - check all hours in the selected date
//         const targetDate = new Date(selectedDate);
//         targetDate.setHours(0, 0, 0, 0);
//         const nextDate = new Date(targetDate);
//         nextDate.setDate(targetDate.getDate() + 1);
        
//         roomNames.forEach(roomName => {
//           const roomDataForDay = rooms.filter(room => 
//             room.FacilityName === roomName && 
//             new Date(room.Time) >= targetDate && 
//             new Date(room.Time) < nextDate
//           );
          
//           if (roomDataForDay.length > 0) {
//             totalRooms++;
            
//             // Check if the room was unbooked and unutilized at any point during the day
//             const wasOpportunity = roomDataForDay.some(roomData => {
//               const bookedStatus = isRoomBooked(roomName, roomData.Time);
//               return bookedStatus === 'unbooked' && roomData.Count === 0;
//             });
            
//             if (wasOpportunity) {
//               opportunityRooms++;
//             }
//           }
//         });
//       } else if (timeFilter === 'week') {
//         // Weekly filter - check all hours in the week containing selected date
//         const targetDate = new Date(selectedDate);
//         targetDate.setHours(0, 0, 0, 0);
//         const dayOfWeek = targetDate.getDay();
//         const startOfWeek = new Date(targetDate);
//         startOfWeek.setDate(targetDate.getDate() - dayOfWeek);
//         const endOfWeek = new Date(startOfWeek);
//         endOfWeek.setDate(startOfWeek.getDate() + 7);
        
//         roomNames.forEach(roomName => {
//           const roomDataForWeek = rooms.filter(room => 
//             room.FacilityName === roomName && 
//             new Date(room.Time) >= startOfWeek && 
//             new Date(room.Time) < endOfWeek
//           );
          
//           if (roomDataForWeek.length > 0) {
//             totalRooms++;
            
//             // Check if the room was unbooked and unutilized at any point during the week
//             const wasOpportunity = roomDataForWeek.some(roomData => {
//               const bookedStatus = isRoomBooked(roomName, roomData.Time);
//               return bookedStatus === 'unbooked' && roomData.Count === 0;
//             });
            
//             if (wasOpportunity) {
//               opportunityRooms++;
//             }
//           }
//         });
//       }
      
//       if (totalRooms > 0) {
//         const percentage = (opportunityRooms / totalRooms) * 100;
//         results.push({
//           building: group.building,
//           floor: group.floor,
//           totalRooms,
//           opportunityRooms,
//           percentage: percentage.toFixed(2)
//         });
//       }
//     });
    
//     setUtilizationData(results);
//   };

//   if (loading) return <div>Loading data...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
//       <h2>Room Utilization Opportunities</h2>
//       <p>Percentage of rooms not booked and unutilized (Count = 0)</p>
      
//       <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
//         <div>
//           <label htmlFor="timeFilter">Time Filter: </label>
//           <select 
//             id="timeFilter" 
//             value={timeFilter}
//             onChange={(e) => setTimeFilter(e.target.value)}
//             style={{ padding: '5px' }}
//           >
//             <option value="hour">By Hour</option>
//             <option value="day">By Day</option>
//             <option value="week">By Week</option>
//           </select>
//         </div>
        
//         <div>
//           <label htmlFor="datePicker">Date: </label>
//           <input 
//             type="date" 
//             id="datePicker"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             style={{ padding: '5px' }}
//           />
//         </div>
        
//         {timeFilter === 'hour' && (
//           <div>
//             <label htmlFor="hourPicker">Hour: </label>
//             <select
//               id="hourPicker"
//               value={selectedHour}
//               onChange={(e) => setSelectedHour(parseInt(e.target.value))}
//               style={{ padding: '5px' }}
//             >
//               {Array.from({ length: 24 }, (_, i) => (
//                 <option key={i} value={i}>{i}:00</option>
//               ))}
//             </select>
//           </div>
//         )}
//       </div>

//       {utilizationData.length > 0 && (
//         <div style={{ marginTop: '30px', height: '400px' }}>
//           <h3>Visualization</h3>
//           <Bar
//             data={{
//               labels: utilizationData.map(item => `${item.building} - ${item.floor}`),
//               datasets: [
//                 {
//                   label: '% Not Booked and Unutilized',
//                   data: utilizationData.map(item => parseFloat(item.percentage)),
//                   backgroundColor: 'rgba(255, 99, 132, 0.6)',
//                   borderColor: 'rgba(255, 99, 132, 1)',
//                   borderWidth: 1
//                 }
//               ]
//             }}
//             options={{
//               responsive: true,
//               maintainAspectRatio: false,
//               scales: {
//                 y: {
//                   beginAtZero: true,
//                   max: 100,
//                   title: {
//                     display: true,
//                     text: 'Percentage (%)'
//                   }
//                 },
//                 x: {
//                   title: {
//                     display: true,
//                     text: 'Building and Floor'
//                   }
//                 }
//               },
//               plugins: {
//                 title: {
//                   display: true,
//                   text: 'Percentage of Rooms Not Booked and Unutilized (Opportunities)'
//                 },
//                 tooltip: {
//                   callbacks: {
//                     label: function(context) {
//                       const data = utilizationData[context.dataIndex];
//                       return [
//                         `Building: ${data.building}`,
//                         `Floor: ${data.floor}`,
//                         `Total Rooms: ${data.totalRooms}`,
//                         `Opportunity Rooms: ${data.opportunityRooms}`,
//                         `Percentage: ${data.percentage}%`
//                       ];
//                     }
//                   }
//                 }
//               }
//             }}
//           />
//         </div>
//       )}
      
//       {utilizationData.length > 0 ? (
//         <div style={{ overflowX: 'auto' }}>
//           <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
//             <thead>
//               <tr style={{ backgroundColor: '#f2f2f2' }}>
//                 <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Building</th>
//                 <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Floor</th>
//                 <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Total Rooms</th>
//                 <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Opportunity Rooms</th>
//                 <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Percentage</th>
//               </tr>
//             </thead>
//             <tbody>
//               {utilizationData.map((data, index) => (
//                 <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
//                   <td style={{ padding: '12px', textAlign: 'left' }}>{data.building}</td>
//                   <td style={{ padding: '12px', textAlign: 'left' }}>{data.floor}</td>
//                   <td style={{ padding: '12px', textAlign: 'right' }}>{data.totalRooms}</td>
//                   <td style={{ padding: '12px', textAlign: 'right' }}>{data.opportunityRooms}</td>
//                   <td style={{ padding: '12px', textAlign: 'right' }}>{data.percentage}%</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <div>No data available for the selected filters</div>
//       )}
//     </div>
//   );
// };

// export default Table3;

import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Table3 = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('hour');
  const [selectedDate, setSelectedDate] = useState('2025-01-17');
  const [selectedHour, setSelectedHour] = useState(8);
  const [utilizationData, setUtilizationData] = useState([]);

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

  // Calculate utilization data when filters or data change
  useEffect(() => {
    if (bookings.length > 0 && rooms.length > 0) {
      calculateOpportunities();
    }
  }, [bookings, rooms, timeFilter, selectedDate, selectedHour]);

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

  // Function to check if a room is booked at a specific time
  const isRoomBooked = (facilityName, time) => {
    const roomBookings = bookings.filter(booking => 
      booking.FacilityName === facilityName
    );
    
    const timeDate = new Date(time);
    
    for (const booking of roomBookings) {
      const startTime = new Date(booking.BookingStartTime);
      const endTime = new Date(booking.BookingEndTime);
      
      if (timeDate >= startTime && timeDate < endTime) {
        return booking.BookingStatus === 'Confirmed' ? 'booked' : 'unbooked';
      }
    }
    
    return 'unbooked';
  };

  // Calculate opportunity percentages (unbooked and unutilized rooms)
  const calculateOpportunities = () => {
    const buildingFloorGroups = {};
    
    // First process all rooms to create complete building/floor groups
    rooms.forEach(room => {
      const { building, floor } = getBuildingAndFloor(room.FacilityName);
      const key = `${building}|${floor}`;
      
      if (!buildingFloorGroups[key]) {
        buildingFloorGroups[key] = {
          building,
          floor,
          rooms: new Set()
        };
      }
      
      if (room.FacilityName) {
        buildingFloorGroups[key].rooms.add(room.FacilityName);
      }
    });

    // Then process bookings to ensure we have all possible rooms
    bookings.forEach(booking => {
      const { building, floor } = booking.FacilityName 
        ? getBuildingAndFloor(booking.FacilityName)
        : { building: booking.Building || 'Unknown', floor: booking.Floor || 'Unknown' };
      
      const key = `${building}|${floor}`;
      
      if (!buildingFloorGroups[key]) {
        buildingFloorGroups[key] = {
          building,
          floor,
          rooms: new Set()
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
      let opportunityRooms = 0;
      
      if (timeFilter === 'hour') {
        const targetTime = new Date(`${selectedDate}T${String(selectedHour).padStart(2, '0')}:00:00`);
        
        roomNames.forEach(roomName => {
          const roomData = rooms.find(room => 
            room.FacilityName === roomName && 
            new Date(room.Time).getTime() === targetTime.getTime()
          );
          
          if (roomData) {
            totalRooms++;
            const bookedStatus = isRoomBooked(roomName, roomData.Time);
            
            if (bookedStatus === 'unbooked' && roomData.Count === 0) {
              opportunityRooms++;
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
              opportunityRooms++;
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
              opportunityRooms++;
            }
          }
        });
      }
      
      if (totalRooms > 0) {
        const percentage = (opportunityRooms / totalRooms) * 100;
        results.push({
          building: group.building,
          floor: group.floor,
          totalRooms,
          opportunityRooms,
          percentage: percentage.toFixed(2)
        });
      }
    });

    // Sort results by building and floor for better organization
    const sortedResults = results.sort((a, b) => {
      if (a.building < b.building) return -1;
      if (a.building > b.building) return 1;
      if (a.floor < b.floor) return -1;
      if (a.floor > b.floor) return 1;
      return 0;
    });
    
    setUtilizationData(sortedResults);
  };

  if (loading) return <div>Loading data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Room Utilization Opportunities</h2>
      <p>Percentage of rooms not booked and unutilized (Count = 0)</p>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <label htmlFor="timeFilter">Time Filter: </label>
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
        
        <div>
          <label htmlFor="datePicker">Date: </label>
          <input 
            type="date" 
            id="datePicker"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '5px' }}
          />
        </div>
        
        {timeFilter === 'hour' && (
          <div>
            <label htmlFor="hourPicker">Hour: </label>
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

      {utilizationData.length > 0 && (
        <div style={{ marginTop: '30px', height: '400px' }}>
          <h3>Visualization</h3>
          <Bar
            data={{
              labels: utilizationData.map(item => `${item.building} - ${item.floor}`),
              datasets: [
                {
                  label: '% Not Booked and Unutilized',
                  data: utilizationData.map(item => parseFloat(item.percentage)),
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
                title: {
                  display: true,
                  text: 'Percentage of Rooms Not Booked and Unutilized (Opportunities)'
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const data = utilizationData[context.dataIndex];
                      return [
                        `Building: ${data.building}`,
                        `Floor: ${data.floor}`,
                        `Total Rooms: ${data.totalRooms}`,
                        `Opportunity Rooms: ${data.opportunityRooms}`,
                        `Percentage: ${data.percentage}%`
                      ];
                    }
                  }
                }
              }
            }}
          />
        </div>
      )}
      
      {utilizationData.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Building</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Floor</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Total Rooms</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Opportunity Rooms</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {utilizationData.map((data, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px', textAlign: 'left' }}>{data.building}</td>
                  <td style={{ padding: '12px', textAlign: 'left' }}>{data.floor}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{data.totalRooms}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{data.opportunityRooms}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{data.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>No data available for the selected filters</div>
      )}
    </div>
  );
};

export default Table3;