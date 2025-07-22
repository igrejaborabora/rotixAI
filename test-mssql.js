// Test MSSQL connection directly
const sql = require('mssql');
require('dotenv').config({ path: '.env.local' });

const config = {
  server: process.env.MSSQL_SERVER,
  database: process.env.MSSQL_DATABASE,
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  port: parseInt(process.env.MSSQL_PORT || "1433", 10),
  connectionTimeout: 15000, // 15 seconds
  requestTimeout: 15000,     // 15 seconds
  options: {
    encrypt: process.env.MSSQL_ENCRYPT === "true",
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 1,
    min: 0,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 15000,
  },
};

console.log('Testing MSSQL connection...');
console.log('Config:', {
  server: config.server,
  database: config.database,
  user: config.user,
  port: config.port,
  password: config.password ? 'SET' : 'NOT_SET'
});

async function testConnection() {
  try {
    console.log('Connecting to MSSQL...');
    const pool = await sql.connect(config);
    console.log('Connected successfully!');
    
    console.log('Running test query...');
    const result = await pool.request().query('SELECT TOP 1 * FROM dbo.Vendas');
    console.log('Query successful! Records found:', result.recordset.length);
    
    if (result.recordset.length > 0) {
      console.log('Sample record:', result.recordset[0]);
    }
    
    await pool.close();
    console.log('Connection closed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('MSSQL Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Set timeout
setTimeout(() => {
  console.error('Test timeout after 30 seconds');
  process.exit(1);
}, 30000);

testConnection();
