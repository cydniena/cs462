import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RoomTable from '../components/RoomTable';
import BookingTable from '../components/BookingTable';

const Dashboard = () => {
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);

    // Fetch rooms data
    useEffect(() => {
        axios.get('http://localhost:5005/api/rooms')
            .then((response) => setRooms(response.data))
            .catch((error) => console.error('Error fetching rooms:', error));
    }, []);

    // Fetch bookings data
    useEffect(() => {
        axios.get('http://localhost:5005/api/bookings')
            .then((response) => setBookings(response.data))
            .catch((error) => console.error('Error fetching bookings:', error));
    }, []);

    return (
        <div>
            <h1>Room Utilization Dashboard</h1>
            <RoomTable rooms={rooms} />
            <BookingTable bookings={bookings} />
        </div>
    );
};

export default Dashboard;
