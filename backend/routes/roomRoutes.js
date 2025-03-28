// backend/routes/roomRoutes.js
const express = require('express');
const Room = require('../models/Room');

const router = express.Router();

// Route to get all rooms data
router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Route to get room data by facility name
router.get('/:facilityName', async (req, res) => {
    try {
        const rooms = await Room.find({ facilityName: req.params.facilityName });
        res.status(200).json(rooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
