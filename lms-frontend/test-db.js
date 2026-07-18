const { Client } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_JRH8kpEzuS0e@ep-sparkling-sound-atvsjjr6.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function run() {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log("SUCCESS: Connected to Neon successfully!");
    const res = await client.query("SELECT current_database(), current_schema();");
    console.log("Query Results:", res.rows);
  } catch (err) {
    console.error("CONNECTION ERROR:", err.message);
  } finally {
    await client.end();
  }
}

run();
