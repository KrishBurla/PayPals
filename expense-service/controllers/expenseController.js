const Expense = require('../models/Expense');
const { publishToQueue } = require('../../shared/rabbitmq');

exports.addExpense = async (req, res) => {
    try {
        const { groupId, amount, description, splitType, participants } = req.body;
        // The API Gateway passes the logged-in user's ID via headers!
        const paidBy = req.headers['x-user-id']; 
        
        let splits = [];

        // 🧮 Core Split Logic
        if (splitType === 'EQUAL') {
            // participants is an array of userIds: ["id1", "id2"]
            const splitAmount = amount / participants.length;
            splits = participants.map(userId => ({ userId, amountOwed: splitAmount }));
        } 
        else if (splitType === 'EXACT') {
            // participants includes exact amounts: [{ userId: "id1", exact: 40 }, { userId: "id2", exact: 60 }]
            const totalExact = participants.reduce((acc, p) => acc + p.exact, 0);
            if (totalExact !== amount) return res.status(400).json({ error: "Exact amounts do not sum to total" });
            splits = participants.map(p => ({ userId: p.userId, amountOwed: p.exact }));
        }
        else if (splitType === 'PERCENTAGE') {
            // participants includes percentages: [{ userId: "id1", percent: 40 }, { userId: "id2", percent: 60 }]
            const totalPercent = participants.reduce((acc, p) => acc + p.percent, 0);
            if (totalPercent !== 100) return res.status(400).json({ error: "Percentages do not sum to 100" });
            splits = participants.map(p => ({ userId: p.userId, amountOwed: (amount * p.percent) / 100 }));
        }

        // Save to Database
        const expense = new Expense({ groupId, paidBy, amount, description, splitType, splits });
        await expense.save();

        // 📢 Notify other services via RabbitMQ
        await publishToQueue('expense_created', {
            expenseId: expense._id,
            groupId,
            paidBy,
            splits
        });

        res.status(201).json({ message: "Expense added successfully", expense });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error while creating expense" });
    }
};