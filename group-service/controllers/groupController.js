const Group = require('../models/Group');

exports.createGroup = async (req, res) => {
    try {
        const { name, members } = req.body;
        const createdBy = req.body.createdBy || req.headers['x-user-id'];
        
        // Ensure the creator is in the members list
        const groupMembers = members ? [...new Set([...members, createdBy])] : [createdBy];

        const group = new Group({
            name,
            createdBy,
            members: groupMembers
        });

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
        // The API Gateway passes this header to us automatically!
        const userId = req.headers['x-user-id']; 
        
        // Find any group where this user's ID is inside the 'members' array
        const groups = await Group.find({ members: userId }).sort({ createdAt: -1 });
        
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ error: "Error fetching user groups" });
    }
};

exports.addMember = async (req, res) => {
    try {
        const { userId } = req.body;
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ error: "Group not found" });

        if (!group.members.includes(userId)) {
            group.members.push(userId);
            await group.save();
        }

        res.status(200).json({ message: "Member added", group });
    } catch (error) {
        res.status(500).json({ error: "Error adding member" });
    }
};