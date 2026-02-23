const { Pool } = require('pg');

// Database credentials - PostgreSQL via Cloudflare tunnel
// Pre-requisite: run `cloudflared access tcp --hostname postgres.forgixrobotic.com --url localhost:5002`
const pool = new Pool({
    host: 'localhost',
    port: 5002,
    database: 'tifa',
    user: 'tifa',
    password: 'TifaBot2025@',
});

async function testConnection() {
    try {
        console.log('Testing connection to:', {
            host: pool.options.host,
            database: pool.options.database,
            user: pool.options.user
        });

        const client = await pool.connect();
        console.log('✅ Connection successful!');

        const res = await client.query('SELECT NOW()');
        console.log('Database time:', res.rows[0].now);

        console.log('--- Checking Tables ---');

        // Check t_user
        const userTableRes = await client.query("SELECT to_regclass('public.t_user')");
        if (userTableRes.rows[0].to_regclass) {
            console.log('✅ Table t_user exists.');
            const countRes = await client.query('SELECT COUNT(*) FROM t_user');
            console.log('   Row count:', countRes.rows[0].count);
        } else {
            console.error('❌ Table t_user DOES NOT EXIST.');
        }

        // Check m_role
        const roleTableRes = await client.query("SELECT to_regclass('public.m_role')");
        if (roleTableRes.rows[0].to_regclass) {
            console.log('✅ Table m_role exists.');
            const roles = await client.query('SELECT role_id, role_code FROM m_role');
            console.log('   Roles found:', roles.rows);
        } else {
            console.error('❌ Table m_role DOES NOT EXIST.');
        }

        client.release();
        pool.end();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        if (err.code === '28P01') {
            console.error('Hint: Password authentication failed. Check DB_PASS.');
        }
        pool.end();
    }
}

testConnection();
