const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    groupId: { type: String, required: true },
    paidBy: { type: String, required: true }, // User ID of the payer
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'food' },
    splitType: { type: String, enum: ['EQUAL', 'EXACT', 'PERCENTAGE'], required: true },
    splits: [{
        userId: { type: String, required: true },
        amountOwed: { type: Number, required: true }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);