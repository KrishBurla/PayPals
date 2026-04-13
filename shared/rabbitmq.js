// shared/rabbitmq.js
const amqp = require('amqplib');

let channel = null;

async function connectRabbitMQ() {
    try {
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

async function publishToExchange(exchangeName, data) {
    if (!channel) await connectRabbitMQ();
    await channel.assertExchange(exchangeName, 'fanout', { durable: false });
    channel.publish(exchangeName, '', Buffer.from(JSON.stringify(data)));
}

module.exports = { connectRabbitMQ, publishToQueue, publishToExchange };