import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/data.css';

function RoomData() {
    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [newRoom, setNewRoom] = useState({ FacilityName: '', Time: '', Count: 0, Capacity: 0 });
    const [filters, setFilters] = useState({ FacilityName: '', Time: '', Count: '', Capacity: '' });

    useEffect(() => {
        axios.get('http://localhost:5005/api/rooms')
            .then((response) => {
                setRooms(response.data);
                setFilteredRooms(response.data);
            })
            .catch((error) => console.error('Error fetching rooms:', error));
    }, []);

    useEffect(() => {
        setFilteredRooms(
            rooms.filter(room =>
                Object.keys(filters).every(key => {
                    if (!filters[key]) return true;
                    if (key === 'Time') {
                        return room[key].startsWith(filters[key]);
                    }
                    return room[key].toString().toLowerCase().includes(filters[key].toString().toLowerCase());
                })
            )
        );
    }, [filters, rooms]);

    const addRoom = () => {
        axios.post('http://localhost:5005/api/rooms', newRoom)
            .then((response) => {
                setRooms([...rooms, response.data]);
                setNewRoom({ FacilityName: '', Time: '', Count: 0, Capacity: 0 });
            })
            .catch((error) => console.error('Error adding room:', error));
    };

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

            <div className="form-container">
                <h2>Add New Room</h2>
                <input type="text" placeholder="Facility Name" value={newRoom.FacilityName} onChange={(e) => setNewRoom({ ...newRoom, FacilityName: e.target.value })} />
                <input type="datetime-local" value={newRoom.Time} onChange={(e) => setNewRoom({ ...newRoom, Time: e.target.value })} />
                <input type="number" placeholder="Count" value={newRoom.Count} onChange={(e) => setNewRoom({ ...newRoom, Count: Number(e.target.value) })} />
                <input type="number" placeholder="Capacity" value={newRoom.Capacity} onChange={(e) => setNewRoom({ ...newRoom, Capacity: Number(e.target.value) })} />
                <button onClick={addRoom}>Add Room</button>
            </div>

            <div className="filter-container">
                <h2>Filters</h2>
                <input type="text" placeholder="Facility Name" value={filters.FacilityName} onChange={(e) => setFilters({ ...filters, FacilityName: e.target.value })} />
                <input type="date" value={filters.Time} onChange={(e) => setFilters({ ...filters, Time: e.target.value })} />
                <input type="number" placeholder="Count" value={filters.Count} onChange={(e) => setFilters({ ...filters, Count: e.target.value })} />
                <input type="number" placeholder="Capacity" value={filters.Capacity} onChange={(e) => setFilters({ ...filters, Capacity: e.target.value })} />
            </div>

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
                        {filteredRooms.map((room) => (
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