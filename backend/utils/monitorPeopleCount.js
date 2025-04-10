// monitorPeopleCount.js

const mongoose = require('mongoose');
const PeopleCount = require('../models/PeopleCount'); // adjust path as needed
const Room = require('../models/Room'); // adjust path as needed

const db = mongoose.connection;
db.once('open', () => {
    console.log('Connected to MongoDB. Watching people_counts...');

    const changeStream = PeopleCount.watch();

    changeStream.on('change', async (change) => {
        if (change.operationType === 'insert') {
            const newDoc = change.fullDocument;

            try {
                const timestamp = new Date(newDoc.timestamp);
                const peopleCount = parseInt(newDoc.people_count);

                // Optional: Define rules for FacilityName and Capacity
                const facilityName = 'SCIS1 Classroom 3-1'; 
                const capacity = 50; 

                const roomEntry = new Room({
                    FacilityName: facilityName,
                    Time: timestamp,
                    Count: peopleCount,
                    Capacity: capacity,
                });

                await roomEntry.save();
                console.log('Inserted into rooms:', roomEntry);
            } catch (err) {
                console.error('Error processing new people count:', err);
            }
        }
    });
});
