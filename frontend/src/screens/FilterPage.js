import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../screens/css/FilterPage.css"; // Import the CSS file

const FilterPage = () => {
  const navigate = useNavigate();

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
  };

  return (
    <div className="container">
      <h2>Filter Rooms</h2>
      
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

      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default FilterPage;