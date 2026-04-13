const mongoose = require('mongoose');

async function augment2() {
    const gateway = 'http://127.0.0.1:3000';
    console.log("Seeding multiple groups & dummies...");

    // Register 2 Dummy Users
    for (let u of ['charlie', 'diana']) {
        try {
            await fetch(gateway + '/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: Object.keys({ [u]: 1 })[0].toUpperCase() + ' Dummy', email: `${u}@email.com`, password: "password123!" })
            });
        } catch (e) { } // ignore if exist
    }

    // Login main user
    const loginRes = await fetch(gateway + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: "krishburla@gmail.com", password: "Krish2005$" })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    const myId = JSON.parse(Buffer.from(token.split('.')[1], 'base64')).id;
    const headers = { 'Content-Type': 'application/json', 'Authorization': "Bearer " + token };

    // Find user IDs of dummies
    const usersRes = await fetch(gateway + '/auth/users');
    const allUsers = await usersRes.json();
    const charlie = allUsers.find(u => u.email === 'charlie@email.com');
    const diana = allUsers.find(u => u.email === 'diana@email.com');

    // Create 2 New Groups
    const miamiRes = await fetch(gateway + '/groups', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: "Miami Trip 🏖️", createdBy: myId })
    });
    const miami = await miamiRes.json();
    console.log("Created Miami:", miami);

    const officeRes = await fetch(gateway + '/groups', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: "Office Lunch Fund 🥪", createdBy: myId })
    });
    const office = await officeRes.json();

    // Add members sequentially to avoid parallel issues or race conditions in DB
    await fetch(gateway + `/groups/${miami.group._id}/members`, { method: 'POST', headers, body: JSON.stringify({ userId: charlie.id }) });
    await fetch(gateway + `/groups/${miami.group._id}/members`, { method: 'POST', headers, body: JSON.stringify({ userId: diana.id }) });

    await fetch(gateway + `/groups/${office.group._id}/members`, { method: 'POST', headers, body: JSON.stringify({ userId: charlie.id }) });

    // Seed Expenses in Miami
    const miamiExps = [
        { amount: 800, desc: "AirBnb Split", cat: "home", split: "EQUAL", pId: miami.group._id, members: [myId, charlie.id, diana.id] },
        { amount: 200, desc: "Boat Rental", cat: "entertainment", split: "PERCENTAGE", p: 40, pId: miami.group._id, members: [myId, charlie.id, diana.id] },
        { amount: 150, desc: "Seafood Dinner", cat: "food", split: "EQUAL", pId: miami.group._id, members: [myId, charlie.id, diana.id] }
    ];

    // Seed Expenses in Office
    const officeExps = [
        { amount: 45, desc: "Subway Sandwiches", cat: "food", split: "EQUAL", pId: office.group._id, members: [myId, charlie.id] },
        { amount: 65, desc: "Sushi Delivery", cat: "food", split: "EQUAL", pId: office.group._id, members: [myId, charlie.id] }
    ];

    let allCreatedExpenses = [...miamiExps, ...officeExps];

    for (let e of allCreatedExpenses) {
        let parts = e.members;
        if (e.split === 'PERCENTAGE') {
            parts = e.members.map((m, i) => ({ userId: m, percent: i === 0 ? e.p : (100 - e.p) / (e.members.length - 1) }));
        }

        await fetch(gateway + '/expenses', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                groupId: e.pId,
                amount: e.amount,
                description: e.desc,
                category: e.cat,
                splitType: e.split,
                participants: parts
            })
        });
    }

    console.log("Expenses sent to RabbitMQ.");
    await new Promise(r => setTimeout(r, 2000));

    // Time-Warp
    console.log("Connecting to Mongo to time-warp...");
    await mongoose.connect('mongodb://localhost:27017/splitwise_expenses');
    const mongooseSchema = new mongoose.Schema({}, { strict: false });
    const Expense = mongoose.model('Expense', mongooseSchema, 'expenses');

    let dbExps = await Expense.find({ groupId: { $in: [miami.group._id, office.group._id] } }).sort({ createdAt: -1 });

    const daysToSubtract = [5, 12, 18, 25, 45, 60];
    for (let i = 0; i < dbExps.length; i++) {
        const sub = daysToSubtract[i] || (i * 2);
        const d = new Date();
        d.setDate(d.getDate() - sub);
        await Expense.updateOne({ _id: dbExps[i]._id }, { $set: { createdAt: d } });
    }

    console.log("Done.");
    process.exit(0);
}

augment2();
