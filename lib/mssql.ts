import sql, { config as SQLConfig, ConnectionPool, ISqlTypeFactoryWithLength } from "mssql";

/**
 * Singleton connection pool for MSSQL Server.
 * Re-uses the pool across hot-reloads (Next.js) and across Lambda invocations (Vercel).
 */
let cachedPool: ConnectionPool | null = null;

interface QueryParams {
  [key: string]: any;
}

function getSqlConfig(): SQLConfig {
  if (!process.env.MSSQL_SERVER || !process.env.MSSQL_DATABASE) {
    throw new Error("Missing MSSQL_* environment variables");
  }

  return {
    server: process.env.MSSQL_SERVER!,
    database: process.env.MSSQL_DATABASE!,
    user: process.env.MSSQL_USER!,
    password: process.env.MSSQL_PASSWORD!,
    port: parseInt(process.env.MSSQL_PORT || "1433", 10),
    connectionTimeout: 30000, // 30 seconds
    requestTimeout: 30000,     // 30 seconds
    options: {
      encrypt: process.env.MSSQL_ENCRYPT === "true", // for Azure SQL / TLS-required servers
      trustServerCertificate: true, // allow self-signed certs on VPN/on-prem
      enableArithAbort: true,
    },
    pool: {
      max: 1, // serverless-friendly
      min: 0,
      idleTimeoutMillis: 30000,
      acquireTimeoutMillis: 30000,
    },
  } as unknown as SQLConfig;
}

export async function getPool(): Promise<ConnectionPool> {
  if (cachedPool) {
    return cachedPool;
  }
  const cfg = getSqlConfig();
  cachedPool = await sql.connect(cfg);
  return cachedPool;
}

/**
 * Helper to run parameterised queries.
 * Example:
 *   await query("SELECT TOP 5 * FROM Products WHERE id = @id", { id: 123 });
 */
export async function query<T = any>(sqlText: string, params: QueryParams = {}): Promise<T[]> {
  const pool = await getPool();
  const request = pool.request();
  Object.entries(params).forEach(([key, value]) => {
    request.input(key, value as any);
  });
  const result = await request.query<T>(sqlText);
  return result.recordset;
}

export default { getPool, query };
