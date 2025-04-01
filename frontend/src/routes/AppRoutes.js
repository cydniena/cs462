import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '../screens/Dashboard';
import RoomData from '../screens/RoomData';
import BookingData from '../screens/BookingData';
import BookingUtilized from '../screens/BookedUtilized';
import FloorHeatMap from '../screens/FloorHeatMap';
import Table3 from '../screens/Table3';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/roomData" element={<RoomData />} />
                <Route path="/bookingData" element={<BookingData />} />
                <Route path="/bookingUtilized" element={<BookingUtilized />} />
                <Route path="/floorHeatMap" element={<FloorHeatMap />} />
                <Route path="/table3" element={<Table3 />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
