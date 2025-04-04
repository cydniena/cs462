import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '../screens/Dashboard';
import RoomData from '../screens/RoomData';
import BookingData from '../screens/BookingData';
import BookingUtilized from '../screens/Room/BookedUtilized';
import FloorHeatMap from '../screens/Floor/FloorHeatMap';
import FilterPage from '../screens/FilterPage';
import RoomWeekly from '../screens/Room/RoomWeekly';
import Table3 from '../screens/Table3';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/table3" element={<Table3 />} />
                <Route path="/roomData" element={<RoomData />} />
                <Route path="/bookingData" element={<BookingData />} />
                {/* <Route path="/bookingUtilized" element={<BookingUtilized />} />
                <Route path="/floorHeatMap" element={<FloorHeatMap />} />
                <Route path="/filter" element={<FilterPage/>} />
                <Route path="/roomWeekly" element={<RoomWeekly/>} /> */}
            </Routes>
        </Router>
    );
};

export default AppRoutes;
