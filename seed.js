const axios = require('axios');

const USERS = [
    { name: "Krish Burla", email: "krishburla@gmail.com", password: "Krish2005$" },
    { name: "Shree Bhende", email: "shreebhende@gmail.com", password: "Shree2005$" },
    { name: "Naman Bhatia", email: "namanbhatia@gmail.com", password: "Naman2005$" }
];

async function seed() {
    try {
        console.log("Starting Seed Process...");
        const gateway = 'http://localhost:3000'; // Make sure gateway is running!

        // 1. Register Users
        const registeredUsers = [];
        for (let u of USERS) {
            try {
                const res = await axios.post(gateway + '/auth/register', u);
                console.log("Registered: " + u.name);
                registeredUsers.push({ ...u, id: res.data.userId });
            } catch (err) {
                console.log("Warning registering " + u.name + ": " + (err.response?.data?.error || err.message));
                // Try to get existing user ID
                try {
                    const lRes = await axios.post(gateway + '/auth/login', { email: u.email, password: u.password });
                    // Decode token or just fetch user by email if we had that, 
                    // but for simplicity let's assume register either works or we fetch all next.
                } catch(le) {}
            }
        }
        
        // Fetch all generic users to get IDs
        console.log("Fetching up-to-date user IDs...");
        const userListRes = await axios.get(gateway + '/auth/users');
        const userMap = {}; // email -> id
        userListRes.data.forEach(u => userMap[u.email] = u.id);

        const krishId = userMap["krishburla@gmail.com"];
        const shreeId = userMap["shreebhende@gmail.com"];
        const namanId = userMap["namanbhatia@gmail.com"];
        const allUserIds = [krishId, shreeId, namanId];

        // Login Krish to get token
        const loginRes = await axios.post(gateway + '/auth/login', { email: "krishburla@gmail.com", password: "Krish2005$" });
        const krishToken = loginRes.data.token;
        const krishApi = axios.create({ baseURL: gateway, headers: { Authorization: "Bearer " + krishToken } });

        // 2. Create Group (Now only adds Krish)
        console.log("Creating Group (Initial)...");
        const gRes = await krishApi.post('/groups', { name: "College Flatmates" });
        const groupId = gRes.data.group._id;
        console.log("Group created: ", groupId);
        
        // 3. Invite Shree and Naman
        console.log("Sending Invitations...");
        await krishApi.post(`/groups/${groupId}/invite`, { userId: shreeId, inviterName: "Krish Burla" });
        await krishApi.post(`/groups/${groupId}/invite`, { userId: namanId, inviterName: "Krish Burla" });

        // 4. Accept Invites (Need tokens for Shree and Naman)
        console.log("Accepting Invitations for other users...");
        for (const u of USERS.slice(1)) {
            const uLogin = await axios.post(gateway + '/auth/login', { email: u.email, password: u.password });
            const uToken = uLogin.data.token;
            const uApi = axios.create({ baseURL: gateway, headers: { Authorization: "Bearer " + uToken } });
            
            // Get pending invites
            const invitesRes = await uApi.get('/groups/invites');
            const myInvite = invitesRes.data.find(i => i.groupId === groupId);
            if (myInvite) {
                await uApi.post(`/groups/invites/${myInvite._id}/accept`);
                console.log(`${u.name} accepted invite to College Flatmates`);
            }
        }

        // 5. Add Expenses
        console.log("Injecting Realistic Expenses...");
        const exps = [
            { amount: 150, description: "Groceries @ Trader Joes", category: "food", splitType: "EQUAL", participants: allUserIds },
            { amount: 95.50, description: "Electric Bill", category: "home", splitType: "EQUAL", participants: allUserIds },
            { amount: 45, description: "Uber to Airport", category: "transport", splitType: "EQUAL", participants: [krishId, shreeId] }
        ];

        for (let ex of exps) {
            await krishApi.post('/expenses', { ...ex, groupId });
            console.log("Added expense: ", ex.description);
        }

        console.log("✅ Seed Complete!");

    } catch (error) {
        console.error("❌ Seed Error:");
        console.error(error.response?.data || error.message);
    }
}

seed();
