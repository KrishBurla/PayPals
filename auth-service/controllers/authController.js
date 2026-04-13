const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Hash password and generate a UUID for the user
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = crypto.randomUUID();

        await db.execute(
            'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
            [userId, name, email, hashedPassword]
        );

        res.status(201).json({ message: "User registered successfully", userId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "Email already exists" });
        }
        res.status(500).json({ error: "Server error during registration" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate JWT
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: "Server error during login" });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, name, email FROM users');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: "Server error fetching users" });
    }
};