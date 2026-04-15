const Expense = require('../models/Expense');
const { publishToQueue, publishToExchange } = require('../../shared/rabbitmq');

exports.addExpense = async (req, res) => {
    try {
        const { groupId, amount, description, category, splitType, participants } = req.body;
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
            if (Math.abs(totalExact - amount) > 0.01) return res.status(400).json({ error: "Exact amounts do not sum to total" });
            splits = participants.map(p => ({ userId: p.userId, amountOwed: p.exact }));
        }
        else if (splitType === 'PERCENTAGE') {
            // participants includes percentages: [{ userId: "id1", percent: 40 }, { userId: "id2", percent: 60 }]
            const totalPercent = participants.reduce((acc, p) => acc + p.percent, 0);
            if (totalPercent !== 100) return res.status(400).json({ error: "Percentages do not sum to 100" });
            splits = participants.map(p => ({ userId: p.userId, amountOwed: (amount * p.percent) / 100 }));
        }

        // Save to Database
        const expense = new Expense({ groupId, paidBy, amount, description, category: category || 'food', splitType, splits });
        await expense.save();

        // 📢 Notify other services via RabbitMQ Exchange (Fanout)
        await publishToExchange('expense_events', {
            type: 'expense',
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

exports.updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, amount, category } = req.body;
        const userId = req.headers['x-user-id'];

        const expense = await Expense.findById(id);
        if (!expense) return res.status(404).json({ error: "Expense not found" });

        // Only the person who paid can edit
        if (expense.paidBy !== userId) {
            return res.status(403).json({ error: "Only the payer can edit this expense" });
        }

        const oldSplits = expense.splits.map(s => ({ userId: s.userId, amountOwed: s.amountOwed }));
        const amountChanged = amount !== undefined && amount !== expense.amount;

        if (description !== undefined) expense.description = description;
        if (category !== undefined) expense.category = category;

        if (amountChanged) {
            const newAmount = amount;
            // Recalculate splits proportionally based on the original split ratios
            const oldTotal = expense.amount;
            const ratio = newAmount / oldTotal;
            expense.amount = newAmount;
            expense.splits = expense.splits.map(s => ({
                userId: s.userId,
                amountOwed: parseFloat((s.amountOwed * ratio).toFixed(2))
            }));

            // Publish reversal of old splits (negative amounts)
            await publishToExchange('expense_events', {
                type: 'expense_reversal',
                groupId: expense.groupId,
                paidBy: expense.paidBy,
                splits: oldSplits.map(s => ({ userId: s.userId, amountOwed: -s.amountOwed }))
            });

            // Publish new splits
            await publishToExchange('expense_events', {
                type: 'expense',
                expenseId: expense._id,
                groupId: expense.groupId,
                paidBy: expense.paidBy,
                splits: expense.splits
            });
        }

        await expense.save();
        res.status(200).json({ message: "Expense updated", expense });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error updating expense" });
    }
};

exports.getGroupExpenses = async (req, res) => {
    try {
        const { groupId } = req.params;
        const expenses = await Expense.find({ groupId }).sort({ createdAt: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error fetching expenses" });
    }
};