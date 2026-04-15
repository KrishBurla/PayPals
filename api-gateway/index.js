const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'; // Must match the secret in Auth Service

// Authentication Middleware
const verifyToken = (req, res, next) => {
    // We don't want to block login or registration routes!
    if (req.path.startsWith('/auth')) return next();

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: "Access Denied: No token provided" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }
        
        // Attach the decoded user ID to the headers before forwarding
        // This lets the downstream services (like Group) know WHO is making the request
        req.headers['x-user-id'] = decoded.id; 
        next();
    });
};

// Apply the middleware
app.use(verifyToken);

// Microservice Routing Table
const routes = {
    '/auth': 'http://localhost:3001',   // Forwards to Auth Service
    '/groups': 'http://localhost:3003',  // Forwards to Group Service
    '/expenses': 'http://localhost:3004', // Forwards to Expense Service
    '/settlements': 'http://localhost:3005' // Forwards to Settlement Service
};

// Setup proxies dynamically
for (const [path, target] of Object.entries(routes)) {
    app.use(path, createProxyMiddleware({ 
        target, 
        changeOrigin: true,
        pathRewrite: {
            [`^${path}`]: '' // 🪄 THE FIX: Strips the route (e.g., '/settlements') before forwarding
        },
        onProxyReq: (proxyReq, req, res) => {
            if (req.headers['x-user-id']) {
                proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
            }
        },
        onError: (err, req, res) => {
            console.error(`Proxy error on ${req.url}:`, err.message);
            res.status(502).json({ success: false, message: "Service unavailable or gateway timeout." });
        }
    }));
}

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Gateway Error:", err.stack);
    res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
    console.log(`🌐 API Gateway running on port ${PORT}`);
});