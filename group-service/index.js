// group-service/index.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const ctrl = require('./controllers/groupController');

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

// ─── Group routes ───────────────────────────────────────────────
app.post('/',        ctrl.createGroup);
app.get('/user',     ctrl.getUserGroups);

// ─── Invite routes (must come BEFORE /:id to avoid route conflicts) ───
app.get('/invites',                        ctrl.getMyInvites);
app.post('/invites/:inviteId/accept',      ctrl.acceptInvite);
app.post('/invites/:inviteId/decline',     ctrl.declineInvite);

// ─── Group-specific routes ──────────────────────────────────────
app.get('/:id',           ctrl.getGroup);
app.post('/:id/invite',   ctrl.inviteMember);  // replaces addMember

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`👥 Group Service running on port ${PORT}`);
});