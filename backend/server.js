// // // backend/server.js
// // require('dotenv').config(); // Load environment variables from .env
// // const express = require('express');
// // const mongoose = require('mongoose');
// // const cors = require('cors');
// // const itemRoutes = require('./routes/itemRoutes');

// // const app = express();
// // const port = 5005;

// // // Middleware
// // app.use(cors()); // Enable CORS for React frontend
// // app.use(express.json()); // Parse JSON request bodies

// // const atlasUri = process.env.MONGO_URI;

// // // Connect to MongoDB Atlas
// // mongoose.connect(atlasUri, {
// //     useNewUrlParser: true,
// //     useUnifiedTopology: true,
// // })
// // .then(() => console.log('Connected to MongoDB Atlas'))
// // .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

// // // Routes
// // app.use('/api/items', itemRoutes);

// // // Start the server
// // app.listen(port, () => {
// //     console.log(`Backend server running on http://localhost:${port}`);
// // });

// // backend/server.js
// require('dotenv').config(); // Load environment variables from .env
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');

// // Import the new routes
// const roomRoutes = require('./routes/roomRoutes');
// const bookingRoutes = require('./routes/bookingRoutes');

// const app = express();
// const port = 5005;

// // Middleware
// app.use(cors()); // Enable CORS for React frontend
// app.use(express.json()); // Parse JSON request bodies

// const atlasUri = process.env.MONGO_URI;

// // Connect to MongoDB Atlas
// mongoose.connect(atlasUri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
// .then(() => console.log('Connected to MongoDB Atlas'))
// .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

// // Routes
// app.use('/api/rooms', roomRoutes); // Update to use new roomRoutes
// app.use('/api/bookings', bookingRoutes); // Update to use new bookingRoutes

// // Start the server
// app.listen(port, () => {
//     console.log(`Backend server running on http://localhost:${port}`);
// });
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

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

// Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});
