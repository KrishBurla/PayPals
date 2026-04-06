// shared/rabbitmq.js
const amqp = require('amqplib');

let channel = null;

async function connectRabbitMQ() {
    try {
        // 'amqp://localhost' works when running locally. 
        // In Docker, it will use 'amqp://rabbitmq'
        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
        const connection = await amqp.connect(rabbitUrl);
        channel = await connection.createChannel();
        console.log("✅ Connected to RabbitMQ");
    } catch (error) {
        console.error("❌ RabbitMQ Connection Error:", error);
    }
}

async function publishToQueue(queueName, data) {
    if (!channel) await connectRabbitMQ();
    await channel.assertQueue(queueName);
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
}

module.exports = { connectRabbitMQ, publishToQueue };