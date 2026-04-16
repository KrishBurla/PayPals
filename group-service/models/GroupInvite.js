const mongoose = require('mongoose');

const GroupInviteSchema = new mongoose.Schema({
    groupId:   { type: String, required: true },
    groupName: { type: String, required: true },
    invitedBy: { type: String, required: true }, // userId of sender
    invitedByName: { type: String, default: '' },
    invitedUserId: { type: String, required: true }, // userId of recipient
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

// Prevent duplicate pending invites for the same user/group
GroupInviteSchema.index({ groupId: 1, invitedUserId: 1, status: 1 });

module.exports = mongoose.model('GroupInvite', GroupInviteSchema);
