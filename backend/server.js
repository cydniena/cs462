require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const peopleCountRoutes = require('./routes/peopleCountRoutes');
const { sendTelegramMessage } = require('./utils/telegramScheduler'); 
require('./utils/telegramScheduler'); // Starts the cron job

const app = express();
const port = 5005;

// Middleware
app.use(cors());
app.use(express.json());

const atlasUri = process.env.MONGO_URI;

// Connect to MongoDB Atlas
mongoose.connect(atlasUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

require('./utils/monitorPeopleCount');

// Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/peopleCounts', peopleCountRoutes);

app.get('/send-weekly-telegram', async (req, res) => {
    await sendTelegramMessage("Manual trigger: This is your weekly dashboard summary!");
    res.send("Message sent!");
  });

app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});
