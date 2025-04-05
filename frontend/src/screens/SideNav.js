import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../screens/css/SideNav.css"; 

const SideNav = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [facilityType, setFacilityType] = useState("");
  const [room, setRoom] = useState("");
  const [filteredRooms, setFilteredRooms] = useState([]);

  // All available rooms data
  const allRooms = [
    { value: "SCIS1 Classroom 3-1", building: "SCIS1", floor: "Level 3" },
    { value: "SCIS1 Classroom 3-2", building: "SCIS1", floor: "Level 3" },
    { value: "SCIS1 Classroom 4-1", building: "SCIS1", floor: "Level 4" },
    { value: "SCIS1 Classroom 4-2", building: "SCIS1", floor: "Level 4" },
    { value: "SOE/SCIS2 Seminar Room 3-1", building: "SOE/SCIS2", floor: "Level 3" },
    { value: "SOE/SCIS2 Seminar Room 3-2", building: "SOE/SCIS2", floor: "Level 3" },
  ];

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Filter rooms whenever building or floor changes
  useEffect(() => {
    if (building && floor) {
      const filtered = allRooms.filter(
        (room) => room.building === building && room.floor === floor
      );
      setFilteredRooms(filtered);
      setRoom(""); // Reset room selection when building or floor changes
    } else {
      setFilteredRooms([]);
      setRoom("");
    }
  }, [building, floor]);

  const handleSearch = () => {
    navigate(
      `/results?building=${encodeURIComponent(building)}&floor=${encodeURIComponent(floor)}&facilityType=${encodeURIComponent(facilityType)}&room=${encodeURIComponent(room)}`
    );
    setSidebarOpen(false); // Close sidebar after search
  };

  return (
    <div className="page-container">
      {/* Hamburger Icon */}
      <div className="hamburger-icon" onClick={toggleSidebar}>
        <div className={`bar ${sidebarOpen ? "change" : ""}`}></div>
        <div className={`bar ${sidebarOpen ? "change" : ""}`}></div>
        <div className={`bar ${sidebarOpen ? "change" : ""}`}></div>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-content">
          
          <div className="form-group">
            <label>Select Building:</label>
            <select value={building} onChange={e => setBuilding(e.target.value)}>
              <option value="">-- Select --</option>
              <option value="SCIS1">School of Computing & Information Systems 1</option>
              <option value="SOE/SCIS2">School of Economics/School of Computing & Information Systems 2</option>
            </select>
          </div>

          <div className="form-group">
            <label>Select Floor:</label>
            <select value={floor} onChange={e => setFloor(e.target.value)}>
              <option value="">-- Select --</option>
              <option value="Level 3">Level 3</option>
              <option value="Level 4">Level 4</option>
            </select>
          </div>

          <div className="form-group">
            <label>Select Room:</label>
            <select 
              value={room} 
              onChange={e => setRoom(e.target.value)}
              disabled={!building || !floor}
            >
              <option value="">-- Select --</option>
              {filteredRooms.map((room) => (
                <option key={room.value} value={room.value}>
                  {room.value}
                </option>
              ))}
            </select>
          </div>

          <button className="search-button" onClick={handleSearch}>Search</button>
        </div>
      </div>

      {/* Overlay when sidebar is open */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Main content */}
      <div className="main-content">
        {/* Your main page content goes here */}
        <h1>Room Utilization Dashboard</h1>
        <p>Select filters from the sidebar to view specific room data.</p>
      </div>
    </div>
  );
};

export default SideNav;
