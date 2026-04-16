const Group = require('../models/Group');
const GroupInvite = require('../models/GroupInvite');
const http = require('http');

// Helper: fire-and-forget POST to notification service
function notifyInvite(targetUserId, inviterName, groupName, inviteId) {
    const body = JSON.stringify({ targetUserId, inviterName, groupName, inviteId });
    const req = http.request({
        hostname: 'localhost', port: 3006,
        path: '/invite-notify', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    });
    req.on('error', () => {}); // swallow errors — notification is best-effort
    req.write(body);
    req.end();
}

// ─── Groups ──────────────────────────────────────────────────────────────────

exports.createGroup = async (req, res) => {
    try {
        const { name, members } = req.body;
        const createdBy = req.body.createdBy || req.headers['x-user-id'];
        
        const groupMembers = members ? [...new Set([...members, createdBy])] : [createdBy];

        const group = new Group({ name, createdBy, members: groupMembers });
        await group.save();
        res.status(201).json({ message: "Group created successfully", group });
    } catch (error) {
        res.status(500).json({ error: "Server error while creating group" });
    }
};

exports.getGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ error: "Group not found" });
        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ error: "Server error while fetching group" });
    }
};

exports.getUserGroups = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const groups = await Group.find({ members: userId }).sort({ createdAt: -1 });
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ error: "Error fetching user groups" });
    }
};

// ─── Invites ─────────────────────────────────────────────────────────────────

/**
 * POST /groups/:id/invite
 * Sends an invite to a user. Does NOT add them immediately.
 * Body: { userId, inviterName }
 */
exports.inviteMember = async (req, res) => {
    try {
        const { userId, inviterName } = req.body;
        const invitedBy = req.headers['x-user-id'];
        const groupId = req.params.id;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ error: "Group not found" });

        // Already a member?
        if (group.members.includes(userId)) {
            return res.status(400).json({ error: "User is already a member of this group" });
        }

        // Already has a pending invite?
        const existing = await GroupInvite.findOne({ groupId, invitedUserId: userId, status: 'pending' });
        if (existing) {
            return res.status(400).json({ error: "An invite has already been sent to this user" });
        }

        const invite = new GroupInvite({
            groupId,
            groupName: group.name,
            invitedBy,
            inviterName: inviterName || '',
            invitedUserId: userId,
            status: 'pending'
        });
        await invite.save();

        // Push a real-time WebSocket notification to the invited user
        notifyInvite(userId, inviterName || 'Someone', group.name, invite._id.toString());

        res.status(201).json({ message: "Invite sent successfully", invite });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error sending invite" });
    }
};

/**
 * GET /groups/invites
 * Returns all pending invites for the logged-in user.
 */
exports.getMyInvites = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const invites = await GroupInvite.find({ invitedUserId: userId, status: 'pending' }).sort({ createdAt: -1 });
        res.status(200).json(invites);
    } catch (error) {
        res.status(500).json({ error: "Error fetching invites" });
    }
};

/**
 * POST /groups/invites/:inviteId/accept
 * Accepts the invite and adds the user to the group.
 */
exports.acceptInvite = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const invite = await GroupInvite.findById(req.params.inviteId);

        if (!invite) return res.status(404).json({ error: "Invite not found" });
        if (invite.invitedUserId !== userId) return res.status(403).json({ error: "Not your invite" });
        if (invite.status !== 'pending') return res.status(400).json({ error: "Invite is no longer pending" });

        // Add user to group
        const group = await Group.findById(invite.groupId);
        if (group && !group.members.includes(userId)) {
            group.members.push(userId);
            await group.save();
        }

        invite.status = 'accepted';
        await invite.save();

        res.status(200).json({ message: "Invite accepted", group });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error accepting invite" });
    }
};

/**
 * POST /groups/invites/:inviteId/decline
 * Declines the invite.
 */
exports.declineInvite = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const invite = await GroupInvite.findById(req.params.inviteId);

        if (!invite) return res.status(404).json({ error: "Invite not found" });
        if (invite.invitedUserId !== userId) return res.status(403).json({ error: "Not your invite" });
        if (invite.status !== 'pending') return res.status(400).json({ error: "Invite is no longer pending" });

        invite.status = 'declined';
        await invite.save();

        res.status(200).json({ message: "Invite declined" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error declining invite" });
    }
};