import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/data.css'; // Import the CSS file for styling

function RoomData() {
    const [rooms, setRooms] = useState([]); // Store list of rooms
    const [newRoom, setNewRoom] = useState({
        FacilityName: '',
        Time: '',
        Count: 0,
        Capacity: 0
    });

    // Fetch all rooms from the backend
    useEffect(() => {
        axios.get('http://localhost:5005/api/rooms')
            .then((response) => setRooms(response.data))
            .catch((error) => console.error('Error fetching rooms:', error));
    }, []);

    // Add a new room
    const addRoom = () => {
        axios.post('http://localhost:5005/api/rooms', newRoom)
            .then((response) => {
                setRooms([...rooms, response.data]);
                setNewRoom({
                    FacilityName: '',
                    Time: '',
                    Count: 0,
                    Capacity: 0
                });
            })
            .catch((error) => console.error('Error adding room:', error));
    };

    // Delete a room
    const deleteRoom = (id) => {
        axios.delete(`http://localhost:5005/api/rooms/${id}`)
            .then(() => {
                setRooms(rooms.filter((room) => room._id !== id));
            })
            .catch((error) => console.error('Error deleting room:', error));
    };

    return (
        <div className="container">
            <h1>Room Management</h1>

            {/* Form to add a new room */}
            <div className="form-container">
                <h2>Add New Room</h2>
                <div className="form-field">
                    <input
                        type="text"
                        placeholder="Facility Name"
                        value={newRoom.FacilityName}
                        onChange={(e) => setNewRoom({ ...newRoom, FacilityName: e.target.value })}
                    />
                </div>
                <div className="form-field">
                    <input
                        type="datetime-local"
                        value={newRoom.Time}
                        onChange={(e) => setNewRoom({ ...newRoom, Time: e.target.value })}
                    />
                </div>
                <div className="form-field">
                    <input
                        type="number"
                        placeholder="Count"
                        value={newRoom.Count}
                        onChange={(e) => setNewRoom({ ...newRoom, Count: Number(e.target.value) })}
                    />
                </div>
                <div className="form-field">
                    <input
                        type="number"
                        placeholder="Capacity"
                        value={newRoom.Capacity}
                        onChange={(e) => setNewRoom({ ...newRoom, Capacity: Number(e.target.value) })}
                    />
                </div>
                <button onClick={addRoom}>Add Room</button>
            </div>

            {/* Display list of rooms as a table */}
            <div className="rooms-list">
                <h2>Rooms List</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Facility Name</th>
                            <th>Time</th>
                            <th>Count</th>
                            <th>Capacity</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map((room) => (
                            <tr key={room._id}>
                                <td>{room.FacilityName}</td>
                                <td>{new Date(room.Time).toLocaleString()}</td>
                                <td>{room.Count}</td>
                                <td>{room.Capacity}</td>
                                <td>
                                    <button className="delete-btn" onClick={() => deleteRoom(room._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default RoomData;