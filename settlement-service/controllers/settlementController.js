const redisClient = require('../config/redis');
const amqp = require('amqplib');

// 🎧 Listen for Expense Events
exports.startConsumer = async () => {
    try {
        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
        const connection = await amqp.connect(rabbitUrl);
        const channel = await connection.createChannel();
        
        const queue = 'expense_created';
        await channel.assertQueue(queue);
        
        console.log(`🎧 Settlement Service listening on queue: ${queue}`);

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const event = JSON.parse(msg.content.toString());
                
                // Update Balances in Redis
                // Graph logic: User B owes User A (the payer)
                for (let split of event.splits) {
                    if (split.userId !== event.paidBy) {
                        // Key format: balance:{groupId}:{whoOwes}:{whoIsOwed}
                        const redisKey = `balance:${event.groupId}:${split.userId}:${event.paidBy}`;
                        
                        // Increment the debt by the amount owed
                        await redisClient.incrByFloat(redisKey, split.amountOwed);
                        console.log(`Updated balance: ${split.userId} owes ${event.paidBy} $${split.amountOwed}`);
                    }
                }
                
                channel.ack(msg); // Acknowledge message processing
            }
        });
    } catch (error) {
        console.error("❌ RabbitMQ Consumer Error:", error);
    }
};

// 📊 Get Group Balances
exports.getBalances = async (req, res) => {
    try {
        const { groupId } = req.params;
        
        // Find all keys for this group
        const keys = await redisClient.keys(`balance:${groupId}:*`);
        const balances = {};

        for (let key of keys) {
            const amount = await redisClient.get(key);
            const [, , whoOwes, whoIsOwed] = key.split(':');
            
            balances[`${whoOwes} -> ${whoIsOwed}`] = parseFloat(amount);
        }

        res.status(200).json({ groupId, balances });
    } catch (error) {
        res.status(500).json({ error: "Error fetching balances" });
    }
};