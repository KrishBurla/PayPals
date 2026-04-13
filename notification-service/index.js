// notification-service/index.js
const amqp = require('amqplib');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3006;

async function startNotificationWorker() {
    try {
        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
        const connection = await amqp.connect(rabbitUrl);
        const channel = await connection.createChannel();
        
        const exchange = 'expense_events';
        await channel.assertExchange(exchange, 'fanout', { durable: false });
        
        const q = await channel.assertQueue('', { exclusive: true });
        console.log(`🔔 Notification Service listening on queue: ${q.queue} bound to exchange ${exchange}`);

        channel.bindQueue(q.queue, exchange, '');

        channel.consume(q.queue, (msg) => {
            if (msg !== null) {
                const event = JSON.parse(msg.content.toString());
                
                console.log("Broadcasting to WS connected clients:", event.type || 'expense');
                io.emit('notification', event);
                
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error("❌ Notification Service Error:", error);
    }
}

startNotificationWorker();

server.listen(PORT, () => console.log(`🔔 Notification Service with WS running on port ${PORT}`));
