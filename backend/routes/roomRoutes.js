const express = require('express');
const Room = require('../models/Room');

const router = express.Router();

// Get all rooms
router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a room by facility name
router.get('/:facilityName', async (req, res) => {
    try {
        const rooms = await Room.find({ FacilityName: req.params.facilityName });
        res.status(200).json(rooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new room data
router.post('/', async (req, res) => {
    const { FacilityName, Time, Count, Capacity } = req.body;
    const room = new Room({ FacilityName, Time, Count, Capacity });

    try {
        const newRoom = await room.save();
        res.status(201).json(newRoom);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a room by ID
router.put('/:id', async (req, res) => {
    try {
        const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedRoom) {
            return res.status(404).json({ message: 'Room data not found' });
        }
        res.status(200).json(updatedRoom);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a room by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedRoom = await Room.findByIdAndDelete(req.params.id);
        if (!deletedRoom) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.status(200).json({ message: 'Room data deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;