const mongoose = require('mongoose');
const Expense = require('./models/Expense');
const { createClient } = require('redis');

const seedHistorical = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/splitwise_expenses');
        console.log("Connected to MongoDB");

        const redisClient = createClient({ url: 'redis://localhost:6379' });
        await redisClient.connect();
        console.log("Connected to Redis");

        const existingExpense = await Expense.findOne({});
        let groupId, userIds = [];
        if (!existingExpense) {
            console.log("No existing expenses! Please create at least one expense in the frontend first.");
            process.exit(0);
        }

        groupId = existingExpense.groupId;
        userIds.push(existingExpense.paidBy);
        existingExpense.splits.forEach(s => {
            if (!userIds.includes(s.userId)) userIds.push(s.userId);
        });

        if (userIds.length < 2) {
             console.log("Not enough distinct users found in existing expenses.");
             process.exit(0);
        }

        const descriptions = ["Lunch at Cafe", "Groceries", "Uber", "Movie Tickets", "Dinner Party", "Electricity Bill", "Internet Bill"];
        const categories = ["food", "home", "transport", "entertainment"];

        console.log(`Using groupId: ${groupId} and users: ${userIds.join(', ')}`);

        for (let i = 0; i < 20; i++) {
            const payer = userIds[Math.floor(Math.random() * userIds.length)];
            const borrower = userIds.find(id => id !== payer) || userIds[0];
            const amount = Math.floor(Math.random() * 50) + 10;
            const desc = descriptions[Math.floor(Math.random() * descriptions.length)];
            const cat = categories[Math.floor(Math.random() * categories.length)];

            // Random date between 10 and 90 days ago
            const date = new Date();
            date.setDate(date.getDate() - (Math.floor(Math.random() * 80) + 10));

            const newExpense = new Expense({
                groupId,
                paidBy: payer,
                amount,
                description: desc,
                category: cat,
                splitType: 'EQUAL',
                splits: [
                    { userId: payer, amountOwed: amount / 2 },
                    { userId: borrower, amountOwed: amount / 2 }
                ],
                createdAt: date,
                updatedAt: date
            });

            await newExpense.save();

            // update redis
            const redisKey = `balance:${groupId}:${borrower}:${payer}`;
            await redisClient.incrByFloat(redisKey, amount / 2);

            console.log(`Inserted ${desc} for $${amount} on ${date.toISOString().split('T')[0]}`);
        }

        console.log("Done seeding historical expenses.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seedHistorical();
