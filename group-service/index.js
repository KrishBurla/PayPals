// group-service/index.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
// 🪄 THE FIX IS HERE: We added getUserGroups to the import list!
const { createGroup, getGroup, getUserGroups } = require('./controllers/groupController');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Routes
app.post('/', createGroup);
app.get('/user', getUserGroups); // Fetches groups for the logged-in user
app.get('/:id', getGroup);       // Fetches a specific group by ID
app.post('/:id/members', require('./controllers/groupController').addMember);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`👥 Group Service running on port ${PORT}`);
});