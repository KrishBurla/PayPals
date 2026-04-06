// notification-service/index.js
const amqp = require('amqplib');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3006;

async function startNotificationWorker() {
    try {
        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
        const connection = await amqp.connect(rabbitUrl);
        const channel = await connection.createChannel();
        
        const queue = 'expense_created';
        await channel.assertQueue(queue);
        
        console.log(`🔔 Notification Service listening on queue: ${queue}`);

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const event = JSON.parse(msg.content.toString());
                
                console.log("\n==========================================");
                console.log(`📧 SIMULATED EMAIL NOTIFICATION`);
                console.log(`To: Group ${event.groupId}`);
                console.log(`Subject: New Expense Added!`);
                console.log(`Message: A new expense of $${event.splits.reduce((sum, s) => sum + s.amountOwed, 0).toFixed(2)} was just added by User ${event.paidBy.substring(0,8)}...`);
                console.log("==========================================\n");
                
                channel.ack(msg); // Mark message as handled
            }
        });
    } catch (error) {
        console.error("❌ Notification Service Error:", error);
    }
}

startNotificationWorker();

app.listen(PORT, () => console.log(`🔔 Notification Service running on port ${PORT}`));