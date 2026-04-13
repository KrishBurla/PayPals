const express = require('express');
const cors = require('cors');
const { startConsumer, getBalances } = require('./controllers/settlementController');

const app = express();
app.use(express.json());
app.use(cors());

// Start the RabbitMQ Listener immediately
startConsumer();

// API Route to fetch balances
app.get('/balances/:groupId', getBalances);
app.post('/settle', require('./controllers/settlementController').settleUp);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`💰 Settlement Service running on port ${PORT}`);
});