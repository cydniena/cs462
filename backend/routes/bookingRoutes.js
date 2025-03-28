// backend/routes/bookingRoutes.js
const express = require('express');
const Booking = require('../models/Booking');

const router = express.Router();

// Route to get all bookings data
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Route to get bookings by facility name
router.get('/:facilityName', async (req, res) => {
    try {
        const bookings = await Booking.find({ facilityName: req.params.facilityName });
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
