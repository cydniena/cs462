const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    BookingReferenceNumber: { type: String, required: true },
    BookingStatus: { type: String, required: true },
    BookingStartTime: { type: Date, required: true },
    BookingEndTime: { type: Date, required: true },
    Building: { type: String, required: true },
    FacilityName: { type: String, required: true },
}, { collection: 'bookings' });

module.exports = mongoose.model('Booking', bookingSchema);
