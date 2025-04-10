import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '../screens/Dashboard';
import RoomData from '../screens/RoomData';
import BookingData from '../screens/BookingData';
import BookingUtilized from '../screens/Room/BookedUtilized';
import FloorHeatMap from '../screens/Floor/FloorHeatMap';
import RoomWeekly from '../screens/Room/RoomWeekly';
import Floor from '../screens/Floor';
import SideNav from '../screens/SideNav';
import SpaceUtilisationSummary from '../screens/SpaceUtilisationSummary';
import RoomDetail from '../screens/RoomDetail';
import PeopleCountData from '../screens/PeopleCountData';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/floor" element={<Floor />} />
                <Route path="/roomData" element={<RoomData />} />
                <Route path="/bookingData" element={<BookingData />} />
                <Route path="/sidenav" element={<SideNav/>} />
                <Route path="/" element={<SpaceUtilisationSummary/>} />
                <Route path="/roomSummary" element={<RoomDetail />} />
                <Route path="/peopleCount" element={<PeopleCountData />} />

                {/* <Route path="/bookingUtilized" element={<BookingUtilized />} />
                <Route path="/floorHeatMap" element={<FloorHeatMap />} />
                <Route path="/filter" element={<FilterPage/>} />
                <Route path="/roomWeekly" element={<RoomWeekly/>} /> */}
            </Routes>
        </Router>
    );
};

export default AppRoutes;
