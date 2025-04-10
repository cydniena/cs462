const express = require('express');
const PeopleCount = require('../models/peopleCount'); // Adjust the path as needed

const router = express.Router();

// Create a new people count entry
router.post('/', async (req, res) => {
    try {
        const newCount = new PeopleCount(req.body);
        const savedCount = await newCount.save();
        res.status(201).json(savedCount);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all people count entries
router.get('/', async (req, res) => {
    try {
        const counts = await PeopleCount.find();
        res.json(counts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a people count entry by ID
router.get('/:id', async (req, res) => {
    try {
        const count = await PeopleCount.findById(req.params.id);
        if (!count) return res.status(404).json({ message: 'People count not found' });
        res.json(count);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a people count entry
router.put('/:id', async (req, res) => {
    try {
        const updatedCount = await PeopleCount.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedCount);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a people count entry
router.delete('/:id', async (req, res) => {
    try {
        await PeopleCount.findByIdAndDelete(req.params.id);
        res.json({ message: 'People count entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;