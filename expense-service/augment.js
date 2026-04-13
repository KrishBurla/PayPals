const mongoose = require('mongoose');

async function augment() {
    const gateway = 'http://127.0.0.1:3000';
    
    const loginRes = await fetch(gateway + '/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email: "krishburla@gmail.com", password: "Krish2005$" })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    let groupId, members = [];
    const grps = await fetch(gateway + '/groups/user', { headers: { 'Authorization': "Bearer "+token } });
    const gData = await (grps.json());
    if (gData.length > 0) { groupId = gData[0]._id; members = gData[0].members; }
    else { console.log("No group found"); process.exit(); }

    const headers = { 'Content-Type': 'application/json', 'Authorization': "Bearer " + token };

    const exps = [
        { amount: 1400, desc: "January Rent", cat: "home", split: "EQUAL" },
        { amount: 120, desc: "WiFi Bill", cat: "home", split: "EQUAL" },
        { amount: 200, desc: "Costco Trip", cat: "food", split: "EQUAL" },
        { amount: 50, desc: "Uber to Concert", cat: "transport", split: "PERCENTAGE", p: 60 },
        { amount: 1400, desc: "February Rent", cat: "home", split: "EQUAL" },
        { amount: 45, desc: "Movie Tickets", cat: "entertainment", split: "EQUAL" },
        { amount: 80, desc: "Korean BBQ", cat: "food", split: "PERCENTAGE", p: 50 },
        { amount: 1400, desc: "March Rent", cat: "home", split: "EQUAL" },
        { amount: 110, desc: "Electric Bill", cat: "home", split: "EXACT", exact: 50 },
        { amount: 210, desc: "Walmart Groceries", cat: "food", split: "EQUAL" },
        { amount: 65, desc: "Pizza Delivery", cat: "food", split: "EQUAL" },
        { amount: 90, desc: "Gasoline", cat: "transport", split: "EQUAL" },
    ];

    for (let e of exps) {
        let parts = members;
        if (e.split === 'PERCENTAGE') {
            parts = members.map((m,i) => ({ userId: m, percent: i===0 ? e.p : (100-e.p)/(members.length-1) }));
        } else if (e.split === 'EXACT') {
            parts = members.map((m,i) => ({ userId: m, exact: i===0 ? e.exact : (e.amount-e.exact)/(members.length-1) }));
        }

        await fetch(gateway + '/expenses', {
            method: 'POST',
            headers,
            body: JSON.stringify({ groupId, amount: e.amount, description: e.desc, category: e.cat, splitType: e.split, participants: parts })
        });
    }

    console.log("Expenses added to RabbitMQ & Redis.");
    await new Promise(r => setTimeout(r, 2000));

    console.log("Connecting to Mongo...");
    await mongoose.connect('mongodb://localhost:27017/splitwise_expenses');
    const mongooseSchema = new mongoose.Schema({}, { strict: false });
    const Expense = mongoose.model('Expense', mongooseSchema, 'expenses');
    
    let dbExps = await Expense.find({ groupId }).sort({ createdAt: 1 });
    dbExps = dbExps.slice(-exps.length);

    const daysToSubtract = [120, 115, 100, 90, 85, 70, 65, 55, 40, 20, 10, 2];
    for (let i = 0; i < dbExps.length; i++) {
        const d = new Date();
        d.setDate(d.getDate() - daysToSubtract[i]);
        await Expense.updateOne({ _id: dbExps[i]._id }, { $set: { createdAt: d } });
    }

    console.log("Time-Warp Complete. Data is rich.");
    process.exit(0);
}

augment();
