const mongoose = require('mongoose');

const peopleCountSchema = new mongoose.Schema({
    timestamp: { type: String, required: true },
    people_count: { type: String, required: true },
}, { collection: 'people_counts' });

module.exports = mongoose.models.PeopleCount || mongoose.model('PeopleCount', peopleCountSchema);
