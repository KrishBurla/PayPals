const redisClient = require('../config/redis');
const amqp = require('amqplib');

// 🎧 Listen for Expense Events
exports.startConsumer = async () => {
    try {
        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
        const connection = await amqp.connect(rabbitUrl);
        
        // Handle connection closure
        connection.on('close', () => {
            console.error("❌ RabbitMQ Consumer connection closed. Retrying in 5s...");
            setTimeout(exports.startConsumer, 5000);
        });

        const channel = await connection.createChannel();
        
        const exchange = 'expense_events';
        await channel.assertExchange(exchange, 'fanout', { durable: false });
        
        // Let RabbitMQ create an exclusive, temporary queue for this consumer
        const q = await channel.assertQueue('', { exclusive: true });
        
        console.log(`🎧 Settlement Service connected and listening on queue: ${q.queue}`);

        channel.bindQueue(q.queue, exchange, '');

        channel.consume(q.queue, async (msg) => {
            if (msg !== null) {
                const event = JSON.parse(msg.content.toString());
                
                // Handle settlement
                if (event.type === 'settle') {
                    const redisKey = `balance:${event.groupId}:${event.borrowerId}:${event.lenderId}`;
                    await redisClient.incrByFloat(redisKey, -event.amount);
                    console.log(`Updated balance: ${event.borrowerId} paid ${event.lenderId} $${event.amount}`);
                } else if (event.splits) {
                    // Update Balances in Redis for Expenses
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
                }
                
                channel.ack(msg); // Acknowledge message processing
            }
        });
    } catch (error) {
        console.error("❌ RabbitMQ Consumer Connection Error. Retrying in 5s...");
        setTimeout(exports.startConsumer, 5000);
    }
};

// 📊 Get Group Balances
const { publishToExchange } = require('../../shared/rabbitmq') || {};
const amqpLocal = require('amqplib');

exports.settleUp = async (req, res) => {
    try {
        const { groupId, borrowerId, lenderId, amount } = req.body;
        
        let pQueue = publishToExchange;
        if (!pQueue) {
            pQueue = async (ex, d) => {
                const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
                const connection = await amqpLocal.connect(rabbitUrl);
                const channel = await connection.createChannel();
                await channel.assertExchange(ex, 'fanout', { durable: false });
                channel.publish(ex, '', Buffer.from(JSON.stringify(d)));
                setTimeout(() => { connection.close(); }, 500);
            };
        }
        
        await pQueue('expense_events', {
            type: 'settle',
            groupId, borrowerId, lenderId, amount
        });
        
        res.status(200).json({ message: "Settle queued successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Settle error" });
    }
};

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