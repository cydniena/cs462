import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '../screens/Dashboard';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
