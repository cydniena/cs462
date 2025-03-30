import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '../screens/Dashboard';
import RoomData from '../screens/RoomData';
import BookingData from '../screens/BookingData';
import BookingUtilized from '../screens/BookedUtilized';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/roomData" element={<RoomData />} />
                <Route path="/bookingData" element={<BookingData />} />
                <Route path="/bookingUtilized" element={<BookingUtilized />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
