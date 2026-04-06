const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { addExpense } = require('./controllers/expenseController');

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.post('/', addExpense);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`💸 Expense Service running on port ${PORT}`);
});