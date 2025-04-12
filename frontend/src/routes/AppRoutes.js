import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoomData from '../screens/RoomData';
import BookingData from '../screens/BookingData';
import SideNav from '../screens/SideNav';
import SpaceUtilisationSummary from '../screens/SpaceUtilisationSummary';
import RoomDetail from '../screens/RoomDetail';
import PeopleCountData from '../screens/PeopleCountData';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/roomData" element={<RoomData />} />
                <Route path="/bookingData" element={<BookingData />} />
                <Route path="/sidenav" element={<SideNav/>} />
                <Route path="/" element={<SpaceUtilisationSummary/>} />
                <Route path="/roomSummary" element={<RoomDetail />} />
                <Route path="/peopleCount" element={<PeopleCountData />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
