// backend/models/Room.js
const mongoose = require('mongoose');

// Define the schema for the Room table
const roomSchema = new mongoose.Schema({
    FacilityName: {
        type: String,
        required: true,
    },
    Time: {
        type: Date,
        required: true,
    },
    Count: {
        type: Number,
        required: true,
    },
    Capacity: {
        type: Number,
        required: true,
    },
}, { collection: 'rooms' });

// Create the Room model using the schema
module.exports = mongoose.model('Room', roomSchema);
