const express = require('express');
const cors = require('cors');
const { register, login } = require('./controllers/authController');

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.post('/register', register);
app.post('/login', login);
app.get('/users', require('./controllers/authController').getUsers);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🔐 Auth Service running on port ${PORT}`);
});