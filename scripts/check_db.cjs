const { Client } = require('pg');
const connectionString = 'postgresql://postgres.cplfoowmdakqzoljuwcf:Tresnja369@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?uselibpqcompat=true&sslmode=require';
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
client.connect().then(() => {
    return client.query(`
        SELECT column_name, data_type, udt_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'assets'
        ORDER BY ordinal_position
    `);
}).then(res => {
    console.log(res.rows);
    client.end();
}).catch(console.error);
