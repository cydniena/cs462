import React, { useState, useEffect } from 'react';
import '../screens/css/SideNav.css';
import GridTable from '../components/GridTable';
import SideNav from '../components/SideNav';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import BarChartsAndTable from "../components/BarChartsAndTable";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SpaceUtilisationSummary = () => {
  const [utilisationData, setUtilisationData] = useState([]);
  const [filteredUtilizationData, setFilteredUtilizationData] = useState([]);
  const [roomsData, setRoomsData] = useState([]);
  const [bookingsData, setBookingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectBuilding, setSelectBuilding] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [timeFilter, setTimeFilter] = useState("hour");
  const [selectedDate, setSelectedDate] = useState("2025-01-17");
  const [selectedHour, setSelectedHour] = useState(9);
  const [utilizationData, setUtilizationData] = useState([]);
  const [opportunityData, setOpportunityData] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");

  const filterByBuildings = (data, building) => {
    if (!building) return data;
    return data.filter(item => {
      const buildingName = item.building.includes("School of Computing & Information Systems 1") ? 
        "SCIS1" : "SOE/SCIS2";
      return buildingName === building;
    });
  };

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
        setUtilisationData(processedData);
        setFilteredUtilizationData(processedData);
        setBookings(bookings);
        setRooms(rooms);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getBuildingAndFloor = (facilityName) => {
    if (!facilityName) return { building: "Unknown", floor: "Unknown" };

    let building, floor;

    // Determine building
    if (facilityName.includes("SCIS1")) {
      building = "School of Computing & Information Systems 1";
    } else if (facilityName.includes("SOE/SCIS2")) {
      building =
        "School of Economics/School of Computing & Information Systems 2";
    } else {
      building = "Unknown Building";
    }

    // Determine floor level from pattern like "3-1" or "4-2"
    const levelMatch = facilityName.match(/(\d+)-\d+$/);
    if (levelMatch && levelMatch[1]) {
      floor = `Level ${levelMatch[1]}`;
    } else {
      floor = "Unknown Floor";
    }

    return { building, floor };
  };

  // Calculate all data when filters or data change
    useEffect(() => {
      if (bookings.length > 0 && rooms.length > 0) {
        calculateUtilization();
        calculateOpportunities();
      }
    }, [bookings, rooms, timeFilter, selectedDate, selectedHour]);
  
    // Function to check if a room is booked at a specific time
    const isRoomBooked = (facilityName, time) => {
      const roomBookings = bookings.filter(
        (booking) =>
          booking.FacilityName === facilityName &&
          booking.BookingStatus === "Confirmed"
      );
  
      const timeDate = new Date(time);
  
      for (const booking of roomBookings) {
        const startTime = new Date(booking.BookingStartTime);
        const endTime = new Date(booking.BookingEndTime);
  
        if (timeDate >= startTime && timeDate < endTime) {
          return "booked";
        }
      }
  
      return "unbooked";
    };
    
      // Calculate utilization percentages
      const calculateUtilization = () => {
        const buildingFloorGroups = {};
    
        // First process all rooms to create complete building/floor groups
        rooms.forEach((room) => {
          const { building, floor } = getBuildingAndFloor(room.FacilityName);
          const key = `${building}|${floor}`;
    
          if (!buildingFloorGroups[key]) {
            buildingFloorGroups[key] = {
              building,
              floor,
              rooms: new Set(),
              unbookedUtilizedRooms: [],
              bookedUnutilizedRooms: [],
            };
          }
    
          if (room.FacilityName) {
            buildingFloorGroups[key].rooms.add(room.FacilityName);
          }
        });
    
        // Then process bookings to ensure we have all possible rooms
        bookings.forEach((booking) => {
          const { building, floor } = booking.FacilityName
            ? getBuildingAndFloor(booking.FacilityName)
            : {
                building: booking.Building || "Unknown",
                floor: booking.Floor || "Unknown",
              };
    
          const key = `${building}|${floor}`;
    
          if (!buildingFloorGroups[key]) {
            buildingFloorGroups[key] = {
              building,
              floor,
              rooms: new Set(),
              unbookedUtilizedRooms: [],
              bookedUnutilizedRooms: [],
            };
          }
    
          if (booking.FacilityName) {
            buildingFloorGroups[key].rooms.add(booking.FacilityName);
          }
        });
    
        const results = [];
    
        Object.values(buildingFloorGroups).forEach((group) => {
          const roomNames = Array.from(group.rooms);
          let totalRooms = 0;
          let unbookedUtilizedCount = 0;
          let bookedUnutilizedCount = 0;
          const unbookedUtilizedRooms = [];
          const bookedUnutilizedRooms = [];
    
          if (timeFilter === "hour") {
            const targetTime = new Date(
              `${selectedDate}T${String(selectedHour).padStart(2, "0")}:00:00`
            );
    
            roomNames.forEach((roomName) => {
              const roomData = rooms.find(
                (room) =>
                  room.FacilityName === roomName &&
                  new Date(room.Time).getTime() === targetTime.getTime()
              );
    
              if (roomData) {
                totalRooms++;
                const bookedStatus = isRoomBooked(roomName, roomData.Time);
    
                if (bookedStatus === "unbooked" && roomData.Count > 0) {
                  unbookedUtilizedCount++;
                  unbookedUtilizedRooms.push({
                    name: roomName.replace(`${group.building} `, ""),
                    count: roomData.Count,
                    capacity: roomData.Capacity,
                  });
                } else if (bookedStatus === "booked" && roomData.Count === 0) {
                  bookedUnutilizedCount++;
                  bookedUnutilizedRooms.push({
                    name: roomName.replace(`${group.building} `, ""),
                    capacity: roomData.Capacity,
                  });
                }
              }
            });
          } else if (timeFilter === "day") {
            const targetDate = new Date(selectedDate);
            targetDate.setHours(0, 0, 0, 0);
            const nextDate = new Date(targetDate);
            nextDate.setDate(targetDate.getDate() + 1);
    
            roomNames.forEach((roomName) => {
              const roomDataForDay = rooms.filter(
                (room) =>
                  room.FacilityName === roomName &&
                  new Date(room.Time) >= targetDate &&
                  new Date(room.Time) < nextDate
              );
    
              if (roomDataForDay.length > 0) {
                totalRooms++;
    
                let hasUnbookedUtilized = false;
                let hasBookedUnutilized = false;
    
                roomDataForDay.forEach((roomData) => {
                  const bookedStatus = isRoomBooked(roomName, roomData.Time);
    
                  if (bookedStatus === "unbooked" && roomData.Count > 0) {
                    hasUnbookedUtilized = true;
                  } else if (bookedStatus === "booked" && roomData.Count === 0) {
                    hasBookedUnutilized = true;
                  }
                });
    
                if (hasUnbookedUtilized) {
                  unbookedUtilizedCount++;
                  unbookedUtilizedRooms.push({
                    name: roomName.replace(`${group.building} `, ""),
                    count: "Various",
                    capacity: roomDataForDay[0].Capacity,
                  });
                }
    
                if (hasBookedUnutilized) {
                  bookedUnutilizedCount++;
                  bookedUnutilizedRooms.push({
                    name: roomName.replace(`${group.building} `, ""),
                    capacity: roomDataForDay[0].Capacity,
                  });
                }
              }
            });
          } else if (timeFilter === "week") {
            const targetDate = new Date(selectedDate);
            targetDate.setHours(0, 0, 0, 0);
            const dayOfWeek = targetDate.getDay();
            const startOfWeek = new Date(targetDate);
            startOfWeek.setDate(targetDate.getDate() - dayOfWeek);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 7);
    
            roomNames.forEach((roomName) => {
              const roomDataForWeek = rooms.filter(
                (room) =>
                  room.FacilityName === roomName &&
                  new Date(room.Time) >= startOfWeek &&
                  new Date(room.Time) < endOfWeek
              );
    
              if (roomDataForWeek.length > 0) {
                totalRooms++;
    
                let hasUnbookedUtilized = false;
                let hasBookedUnutilized = false;
    
                roomDataForWeek.forEach((roomData) => {
                  const bookedStatus = isRoomBooked(roomName, roomData.Time);
    
                  if (bookedStatus === "unbooked" && roomData.Count > 0) {
                    hasUnbookedUtilized = true;
                  } else if (bookedStatus === "booked" && roomData.Count === 0) {
                    hasBookedUnutilized = true;
                  }
                });
    
                if (hasUnbookedUtilized) {
                  unbookedUtilizedCount++;
                  unbookedUtilizedRooms.push({
                    name: roomName.replace(`${group.building} `, ""),
                    count: "Various",
                    capacity: roomDataForWeek[0].Capacity,
                  });
                }
    
                if (hasBookedUnutilized) {
                  bookedUnutilizedCount++;
                  bookedUnutilizedRooms.push({
                    name: roomName.replace(`${group.building} `, ""),
                    capacity: roomDataForWeek[0].Capacity,
                  });
                }
              }
            });
          }
    
          if (totalRooms > 0) {
            const unbookedUtilizedPercentage =
              (unbookedUtilizedCount / totalRooms) * 100;
            const bookedUnutilizedPercentage =
              (bookedUnutilizedCount / totalRooms) * 100;
    
            results.push({
              building: group.building,
              floor: group.floor,
              totalRooms,
              unbookedUtilizedCount,
              bookedUnutilizedCount,
              unbookedUtilizedPercentage: unbookedUtilizedPercentage.toFixed(2),
              bookedUnutilizedPercentage: bookedUnutilizedPercentage.toFixed(2),
              unbookedUtilizedRooms,
              bookedUnutilizedRooms,
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
    
      const calculateOpportunities = () => {
        const buildingFloorGroups = {};
    
        // First process all rooms to create complete building/floor groups
        rooms.forEach((room) => {
          const { building, floor } = getBuildingAndFloor(room.FacilityName);
          const key = `${building}|${floor}`;
    
          if (!buildingFloorGroups[key]) {
            buildingFloorGroups[key] = {
              building,
              floor,
              rooms: new Set(),
              opportunityRooms: [], // Track room details
            };
          }
    
          if (room.FacilityName) {
            buildingFloorGroups[key].rooms.add(room.FacilityName);
          }
        });
    
        // Then process bookings to ensure we have all possible rooms
        bookings.forEach((booking) => {
          const { building, floor } = booking.FacilityName
            ? getBuildingAndFloor(booking.FacilityName)
            : {
                building: booking.Building || "Unknown",
                floor: booking.Floor || "Unknown",
              };
    
          const key = `${building}|${floor}`;
    
          if (!buildingFloorGroups[key]) {
            buildingFloorGroups[key] = {
              building,
              floor,
              rooms: new Set(),
              opportunityRooms: [],
            };
          }
    
          if (booking.FacilityName) {
            buildingFloorGroups[key].rooms.add(booking.FacilityName);
          }
        });
    
        const results = [];
    
        Object.values(buildingFloorGroups).forEach((group) => {
          const roomNames = Array.from(group.rooms);
          let totalRooms = 0;
          let opportunityCount = 0;
          const opportunityRoomDetails = [];
    
          if (timeFilter === "hour") {
            const targetTime = new Date(
              `${selectedDate}T${String(selectedHour).padStart(2, "0")}:00:00`
            );
    
            roomNames.forEach((roomName) => {
              const roomData = rooms.find(
                (room) =>
                  room.FacilityName === roomName &&
                  new Date(room.Time).getTime() === targetTime.getTime()
              );
    
              if (roomData) {
                totalRooms++;
                const bookedStatus = isRoomBooked(roomName, roomData.Time);
    
                if (bookedStatus === "unbooked" && roomData.Count === 0) {
                  opportunityCount++;
                  opportunityRoomDetails.push({
                    name: roomName.replace(`${group.building} `, ""),
                    capacity: roomData.Capacity,
                  });
                }
              }
            });
          } else if (timeFilter === "day") {
            const targetDate = new Date(selectedDate);
            targetDate.setHours(0, 0, 0, 0);
            const nextDate = new Date(targetDate);
            nextDate.setDate(targetDate.getDate() + 1);
    
            roomNames.forEach((roomName) => {
              const roomDataForDay = rooms.filter(
                (room) =>
                  room.FacilityName === roomName &&
                  new Date(room.Time) >= targetDate &&
                  new Date(room.Time) < nextDate
              );
    
              if (roomDataForDay.length > 0) {
                totalRooms++;
    
                const wasOpportunity = roomDataForDay.some((roomData) => {
                  const bookedStatus = isRoomBooked(roomName, roomData.Time);
                  return bookedStatus === "unbooked" && roomData.Count === 0;
                });
    
                if (wasOpportunity) {
                  opportunityCount++;
                  opportunityRoomDetails.push({
                    name: roomName.replace(`${group.building} `, ""),
                    capacity: roomDataForDay[0].Capacity,
                  });
                }
              }
            });
          } else if (timeFilter === "week") {
            const targetDate = new Date(selectedDate);
            targetDate.setHours(0, 0, 0, 0);
            const dayOfWeek = targetDate.getDay();
            const startOfWeek = new Date(targetDate);
            startOfWeek.setDate(targetDate.getDate() - dayOfWeek);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 7);
    
            roomNames.forEach((roomName) => {
              const roomDataForWeek = rooms.filter(
                (room) =>
                  room.FacilityName === roomName &&
                  new Date(room.Time) >= startOfWeek &&
                  new Date(room.Time) < endOfWeek
              );
    
              if (roomDataForWeek.length > 0) {
                totalRooms++;
    
                const wasOpportunity = roomDataForWeek.some((roomData) => {
                  const bookedStatus = isRoomBooked(roomName, roomData.Time);
                  return bookedStatus === "unbooked" && roomData.Count === 0;
                });
    
                if (wasOpportunity) {
                  opportunityCount++;
                  opportunityRoomDetails.push({
                    name: roomName.replace(`${group.building} `, ""),
                    capacity: roomDataForWeek[0].Capacity,
                  });
                }
              }
            });
          }
    
          if (totalRooms > 0) {
            const percentage = (opportunityCount / totalRooms) * 100;
            results.push({
              building: group.building,
              floor: group.floor,
              totalRooms,
              opportunityCount,
              opportunityPercentage: percentage.toFixed(2),
              opportunityRoomDetails, // Add room details
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
    
        setOpportunityData(sortedResults);
      };

  // Function to filter data by building
  const filterByBuilding = (building) => {
    setSelectBuilding(building);
    
    if (!building) {
      setFilteredUtilizationData(utilisationData);
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
    setSelectBuilding(building);
    filterByBuilding(building);
    toggleSidebar();
    setSelectedBuilding(building);
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
          roomsData={selectBuilding ? 
            roomsData.filter(room => room.FacilityName.includes(selectBuilding)) : 
            roomsData} 
            selectBuilding={selectBuilding} 
        />
        <div style={{maxWidth: "1000px", marginLeft: "110px", display: "flex" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" , margin: "5px" }}>
            <label htmlFor="timeFilter">Time Filter:</label>
            <select
              id="timeFilter"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              style={{ padding: "5px" }}
            >
              <option value="hour">By Hour</option>
              <option value="day">By Day</option>
              <option value="week">By Week</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "5px" , margin: "5px"}}>
            <label htmlFor="datePicker">Date:</label>
            <input
              type="date"
              id="datePicker"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: "5px" }}
            />
          </div>

          {timeFilter === "hour" && (
            <div style={{ display: "flex", alignItems: "center", gap: "5px" , margin: "5px"}}>
              <label htmlFor="hourPicker">Hour:</label>
              <select
                id="hourPicker"
                value={selectedHour}
                onChange={(e) => setSelectedHour(parseInt(e.target.value))}
                style={{ padding: "5px" }}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i}:00
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        {utilizationData.length > 0 && opportunityData.length > 0 && (
          <>
            <BarChartsAndTable
              utilizationData={filterByBuildings(utilizationData, selectedBuilding)}
              opportunityData={filterByBuildings(opportunityData, selectedBuilding)}
              timeFilter={timeFilter}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SpaceUtilisationSummary;

