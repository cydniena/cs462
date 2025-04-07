import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import OverallStatusPie from "../components/OverallStatusPie";
import FloorHeatMap from "./Floor/FloorHeatMap";
import BarChartsAndTable from "../components/BarChartsAndTable";
import PieCharts from "../components/PieCharts";
import SideNav from '../components/SideNav';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Floor = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("hour");
  const [selectedDate, setSelectedDate] = useState("2025-01-17");
  const [selectedHour, setSelectedHour] = useState(9);
  const [utilizationData, setUtilizationData] = useState([]);
  const [opportunityData, setOpportunityData] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [pieChartData, setPieChartData] = useState([0, 0, 0, 0]);

  // Toggle sidebar functionƒ
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Filter data by building
  const filterByBuildings = (data, building) => {
    if (!building) return data;
    return data.filter(item => {
      const buildingName = item.building.includes("School of Computing & Information Systems 1") ? 
        "SCIS1" : "SOE/SCIS2";
      return buildingName === building;
    });
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsResponse, roomsResponse] = await Promise.all([
          fetch("http://localhost:5005/api/bookings"),
          fetch("http://localhost:5005/api/rooms"),
        ]);

        if (!bookingsResponse.ok || !roomsResponse.ok) {
          throw new Error("Failed to fetch data");
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

  // Calculate percentages for the pie chart
  useEffect(() => {
    if (bookings.length > 0 && rooms.length > 0) {
      let bookedAndUtilized = 0;
      let bookedAndUnutilized = 0;
      let notBookedAndUtilized = 0;
      let notBookedAndUnutilized = 0;

      const targetStart = new Date(selectedDate);
      const targetEnd = new Date(selectedDate);

      if (timeFilter === "hour") {
        targetStart.setHours(selectedHour, 0, 0, 0);
        targetEnd.setHours(selectedHour + 1, 0, 0, 0);
      } else if (timeFilter === "day") {
        targetStart.setHours(0, 0, 0, 0);
        targetEnd.setHours(23, 59, 59, 999);
      }

      bookings.forEach((booking) => {
        const bookingStart = new Date(booking.BookingStartTime);
        const bookingEnd = new Date(booking.BookingEndTime);
        if (
          booking.BookingStatus === "Confirmed" &&
          bookingEnd > targetStart &&
          bookingStart < targetEnd
        ) {
          const hasUtilized = rooms.some((room) => {
            const roomTime = new Date(room.Time);
            return (
              room.FacilityName === booking.FacilityName &&
              roomTime >= targetStart &&
              roomTime < targetEnd &&
              room.Count > 0
            );
          });

          if (hasUtilized) {
            bookedAndUtilized++;
          } else {
            bookedAndUnutilized++;
          }
        }
      });

      rooms.forEach((room) => {
        const roomTime = new Date(room.Time);
        if (roomTime >= targetStart && roomTime < targetEnd) {
          const isBooked = bookings.some((booking) => {
            const bookingStart = new Date(booking.BookingStartTime);
            const bookingEnd = new Date(booking.BookingEndTime);
            return (
              booking.FacilityName === room.FacilityName &&
              booking.BookingStatus === "Confirmed" &&
              roomTime >= bookingStart &&
              roomTime < bookingEnd
            );
          });

          if (!isBooked && room.Count > 0) {
            notBookedAndUtilized++;
          } else if (!isBooked && room.Count === 0) {
            notBookedAndUnutilized++;
          }
        }
      });

      const totalBooked = bookedAndUtilized + bookedAndUnutilized;
      const totalNotBooked = notBookedAndUtilized + notBookedAndUnutilized;

      const percentages = [
        totalBooked > 0 ? (bookedAndUtilized / totalBooked) * 100 : 0,
        totalBooked > 0 ? (bookedAndUnutilized / totalBooked) * 100 : 0,
        totalNotBooked > 0 ? (notBookedAndUtilized / totalNotBooked) * 100 : 0,
        totalNotBooked > 0
          ? (notBookedAndUnutilized / totalNotBooked) * 100
          : 0,
      ];
      setPieChartData(percentages);
    }
  }, [bookings, rooms, timeFilter, selectedDate, selectedHour]);

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

  if (loading) return <div>Loading data...</div>;
  if (error) return <div>Error: {error}</div>;

  // Merge the data for the comprehensive table
  const mergedTableData = utilizationData.map((utilItem) => {
    const oppItem = opportunityData.find(
      (item) =>
        item.building === utilItem.building && item.floor === utilItem.floor
    );

    return {
      ...utilItem,
      opportunityCount: oppItem ? oppItem.opportunityCount : 0,
      opportunityPercentage: oppItem ? oppItem.opportunityPercentage : "0.00",
      opportunityRoomDetails: oppItem ? oppItem.opportunityRoomDetails : []
    };
  });

  // Group pie chart data by building and floor
  const groupedPieChartData = {};
  utilizationData.forEach((data) => {
    const key = `${data.building}|${data.floor}`;
    const oppItem = opportunityData.find(
      (item) => item.building === data.building && item.floor === data.floor
    );
    
    groupedPieChartData[key] = [
      isNaN(parseFloat(data.unbookedUtilizedPercentage))
        ? 0
        : parseFloat(data.unbookedUtilizedPercentage),
      isNaN(parseFloat(data.bookedUnutilizedPercentage))
        ? 0
        : parseFloat(data.bookedUnutilizedPercentage),
      oppItem && !isNaN(parseFloat(oppItem.opportunityPercentage))
        ? parseFloat(oppItem.opportunityPercentage)
        : 0,
      100 -
        ((isNaN(parseFloat(data.unbookedUtilizedPercentage))
          ? 0
          : parseFloat(data.unbookedUtilizedPercentage)) +
          (isNaN(parseFloat(data.bookedUnutilizedPercentage))
            ? 0
            : parseFloat(data.bookedUnutilizedPercentage)) +
          (oppItem && !isNaN(parseFloat(oppItem.opportunityPercentage))
            ? parseFloat(oppItem.opportunityPercentage)
            : 0)),
    ];
  });

  // Ensure "School of Economics/School of Computing & Information Systems 2 - Level 4" is included
  if (
    !groupedPieChartData[
      "School of Economics/School of Computing & Information Systems 2|Level 4"
    ]
  ) {
    groupedPieChartData[
      "School of Economics/School of Computing & Information Systems 2|Level 4"
    ] = [0, 0, 0, 100];
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", display: "flex" }}>
      {/* Side Navigation */}
      <SideNav 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar}
        onBuildingSelect={setSelectedBuilding}
      />

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: sidebarOpen ? "250px" : "0", transition: "margin 0.3s" }}>
        <button 
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            left: sidebarOpen ? '250px' : '0',
            top: '20px',
            zIndex: 1000,
            transition: 'left 0.3s',
            padding: '10px',
            background: '#333',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>

        <h2>Room Utilization Dashboard</h2>

        <div style={{ marginBottom: "20px", display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
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

          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
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

            <PieCharts groupedPieChartData={groupedPieChartData} />
          </>
        )}

        <div style={{ marginTop: "80px" }}>
          <FloorHeatMap
            occupancyData={rooms}
            timeRange={timeFilter}
            selectedDate={selectedDate}
            selectedHour={selectedHour}
          />
        </div>
      </div>
    </div>
  );
};

export default Floor;