const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    FacilityName: { type: String, required: true },
    BookingReferenceNumber: { type: String, required: true }, 
    BookingStatus: { type: String, enum: ['Booked', 'Withdrawn', 'Rejected'], required: true },
    BookingStartTime: { type: Date, required: true }, 
    BookingEndTime: { type: Date, required: true },
    Building: { type: String, required: true },
    FacilityType: { type: String, enum: ['Classroom', 'Seminar Room'], required: true },
    Floor: { type: String, required: true },
});

module.exports = mongoose.model('Booking', bookingSchema, 'occupancy.bookings');
