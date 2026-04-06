const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    createdBy: { type: String, required: true }, // User ID from Auth Service
    members: [{ type: String }], // Array of User IDs
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', GroupSchema);