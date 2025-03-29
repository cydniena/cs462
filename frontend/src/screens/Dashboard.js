import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RoomTable from '../components/RoomTable';

const Dashboard = () => {
    const [rooms, setRooms] = useState([]);

    // Fetch rooms data
    useEffect(() => {
        axios.get('http://localhost:5005/api/rooms')
            .then((response) => setRooms(response.data))
            .catch((error) => console.error('Error fetching rooms:', error));
    }, []);

    return (
        <div>
            <h1>Room Utilization Dashboard</h1>
            <RoomTable rooms={rooms} />
        </div>
    );
};

export default Dashboard;
