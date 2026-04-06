const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'splitwise_auth',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Auto-create table
async function initDB() {
    const connection = await pool.getConnection();
    await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    connection.release();
    console.log("✅ MySQL Connected & Users table ready");
}

initDB().catch(console.error);

module.exports = pool;