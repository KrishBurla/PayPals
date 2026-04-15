// notification-service/index.js
const amqp = require('amqplib');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
    const userId = socket.handshake.query?.userId;
    if (userId) {
        socket.join(userId);
        console.log(`👤 User ${userId} joined their notification room`);
    }
});

// POST /remind — send a targeted reminder notification
app.post('/remind', (req, res) => {
    const { targetUserId, fromUserName, amount, groupName } = req.body;
    if (!targetUserId) return res.status(400).json({ error: 'targetUserId required' });
    
    io.to(targetUserId).emit('notification', {
        type: 'remind',
        message: `💸 ${fromUserName || 'Someone'} is reminding you that you owe ${amount ? `$${amount.toFixed(2)}` : 'money'}${groupName ? ` in "${groupName}"` : ''}`,
        fromUserName,
        amount,
        groupName,
        timestamp: new Date().toISOString()
    });
    
    console.log(`🔔 Reminder sent to ${targetUserId} from ${fromUserName}`);
    res.json({ success: true, message: 'Reminder sent' });
});

const PORT = process.env.PORT || 3006;

async function startNotificationWorker() {
    try {
        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
        const connection = await amqp.connect(rabbitUrl);
        
        connection.on('close', () => {
            console.error("❌ RabbitMQ Connection closed. Retrying in 5s...");
            setTimeout(startNotificationWorker, 5000);
        });

        const channel = await connection.createChannel();
        
        const exchange = 'expense_events';
        await channel.assertExchange(exchange, 'fanout', { durable: false });
        
        const q = await channel.assertQueue('', { exclusive: true });
        console.log(`🔔 Notification Service connected and listening on queue: ${q.queue}`);

        channel.bindQueue(q.queue, exchange, '');

        channel.consume(q.queue, (msg) => {
            if (msg !== null) {
                const event = JSON.parse(msg.content.toString());
                
                console.log("Broadcasting to WS connected clients:", event.type || 'expense');
                
                if (event.type === 'settle') {
                    if (event.borrowerId) io.to(event.borrowerId).emit('notification', event);
                    if (event.lenderId) io.to(event.lenderId).emit('notification', event);
                } else if (event.type === 'expense' || event.splits) {
                    const involvedUsers = new Set();
                    if (event.paidBy) involvedUsers.add(event.paidBy);
                    if (event.splits) {
                        event.splits.forEach(s => involvedUsers.add(s.userId));
                    }
                    if (event.participants) {
                        event.participants.forEach(p => involvedUsers.add(p.userId ? p.userId : p));
                    }
                    
                    involvedUsers.forEach(uid => {
                        io.to(uid).emit('notification', event);
                    });
                } else {
                    io.emit('notification', event);
                }
                
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error("❌ Notification Service Connection Error. Retrying in 5s...");
        setTimeout(startNotificationWorker, 5000);
    }
}

startNotificationWorker();

server.listen(PORT, () => console.log(`🔔 Notification Service with WS running on port ${PORT}`));
