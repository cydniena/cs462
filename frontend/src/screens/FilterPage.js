// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const FilterPage = () => {
//   const navigate = useNavigate();

//   const [building, setBuilding] = useState("");
//   const [floor, setFloor] = useState("");
//   const [facilityType, setFacilityType] = useState("");
//   const [room, setRoom] = useState("");

//   const handleSearch = () => {
//     navigate(
//       `/results?building=${encodeURIComponent(building)}&floor=${encodeURIComponent(floor)}&facilityType=${encodeURIComponent(facilityType)}&room=${encodeURIComponent(room)}`
//     );
//   };

//   return (
//     <div className="flex flex-col gap-4 p-6 max-w-md mx-auto bg-white shadow-lg rounded-lg border border-gray-200">
//       <h2 className="text-2xl font-semibold text-gray-800 text-center">Filter Rooms</h2>
      
//       <div className="flex flex-col gap-2">
//         <label className="font-medium text-gray-700">Select Building:</label>
//         <select className="p-2 border rounded-lg" value={building} onChange={e => setBuilding(e.target.value)}>
//           <option value="">-- Select --</option>
//           <option value="SCIS1">School of Computing & Information Systems 1</option>
//           <option value="SOE/SCIS2">School of Economics/School of Computing & Information Systems 2</option>
//         </select>
//       </div>
      
//       <div className="flex flex-col gap-2">
//         <label className="font-medium text-gray-700">Select Floor:</label>
//         <select className="p-2 border rounded-lg" value={floor} onChange={e => setFloor(e.target.value)}>
//           <option value="">-- Select --</option>
//           <option value="Level 3">Level 3</option>
//           <option value="Level 4">Level 4</option>
//         </select>
//       </div>
      
//       <div className="flex flex-col gap-2">
//         <label className="font-medium text-gray-700">Select Facility Type:</label>
//         <select className="p-2 border rounded-lg" value={facilityType} onChange={e => setFacilityType(e.target.value)}>
//           <option value="">-- Select --</option>
//           <option value="Classroom">Classroom</option>
//           <option value="Seminar Room">Seminar Room</option>
//         </select>
//       </div>
      
//       <div className="flex flex-col gap-2">
//         <label className="font-medium text-gray-700">Select Room:</label>
//         <select className="p-2 border rounded-lg" value={room} onChange={e => setRoom(e.target.value)}>
//           <option value="">-- Select --</option>
//           <option value="SCIS1 Classroom 3-1">SCIS1 Classroom 3-1</option>
//           <option value="SCIS1 Classroom 3-2">SCIS1 Classroom 3-2</option>
//           <option value="SCIS1 Classroom 4-1">SCIS1 Classroom 4-1</option>
//           <option value="SCIS1 Classroom 4-2">SCIS1 Classroom 4-2</option>
//           <option value="SOE/SCIS2 Seminar Room 3-1">SOE/SCIS2 Seminar Room 3-1</option>
//           <option value="SOE/SCIS2 Seminar Room 3-2">SOE/SCIS2 Seminar Room 3-2</option>
//         </select>
//       </div>
      
//       <button onClick={handleSearch} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-lg">
//         Search
//       </button>
//     </div>
//   );
// };

// export default FilterPage;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../screens/css/FilterPage.css"; // Import the CSS file

const FilterPage = () => {
  const navigate = useNavigate();

  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [facilityType, setFacilityType] = useState("");
  const [room, setRoom] = useState("");

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
        <label>Select Facility Type:</label>
        <select value={facilityType} onChange={e => setFacilityType(e.target.value)}>
          <option value="">-- Select --</option>
          <option value="Classroom">Classroom</option>
          <option value="Seminar Room">Seminar Room</option>
        </select>
      </div>

      <div className="form-group">
        <label>Select Room:</label>
        <select value={room} onChange={e => setRoom(e.target.value)}>
          <option value="">-- Select --</option>
          <option value="SCIS1 Classroom 3-1">SCIS1 Classroom 3-1</option>
          <option value="SCIS1 Classroom 3-2">SCIS1 Classroom 3-2</option>
          <option value="SCIS1 Classroom 4-1">SCIS1 Classroom 4-1</option>
          <option value="SCIS1 Classroom 4-2">SCIS1 Classroom 4-2</option>
          <option value="SOE/SCIS2 Seminar Room 3-1">SOE/SCIS2 Seminar Room 3-1</option>
          <option value="SOE/SCIS2 Seminar Room 3-2">SOE/SCIS2 Seminar Room 3-2</option>
        </select>
      </div>

      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default FilterPage;