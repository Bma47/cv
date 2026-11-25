import { Pool, type QueryResultRow } from 'pg'
import { createPool, type Pool as MySQLPool, type ResultSetHeader } from 'mysql2/promise'

type DatabaseDriver = 'postgres' | 'mysql'
type QueryResult<T> = { rows: T[]; rowCount: number }

const globalForDb = globalThis as typeof globalThis & {
  pgPool?: Pool
  mysqlPool?: MySQLPool
}

function getDriver(): DatabaseDriver {
  const driver = process.env.DB_DRIVER ?? 'postgres'
  if (driver !== 'postgres' && driver !== 'mysql') {
    throw new Error('DB_DRIVER must be either postgres or mysql')
  }
  return driver
}

function getPostgresPool() {
  if (!process.env.PGDATABASE || !process.env.PGUSER || !process.env.PGPASSWORD) {
    throw new Error('PGDATABASE, PGUSER, and PGPASSWORD must be configured')
  }

  if (!globalForDb.pgPool) {
    globalForDb.pgPool = new Pool({
      host: process.env.PGHOST ?? '127.0.0.1',
      port: Number(process.env.PGPORT ?? 5432),
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    })
  }

  return globalForDb.pgPool
}

function getMySQLPool() {
  if (!process.env.MYSQL_DATABASE || !process.env.MYSQL_USER || !process.env.MYSQL_PASSWORD) {
    throw new Error('MYSQL_DATABASE, MYSQL_USER, and MYSQL_PASSWORD must be configured')
  }

  if (!globalForDb.mysqlPool) {
    globalForDb.mysqlPool = createPool({
      host: process.env.MYSQL_HOST ?? '127.0.0.1',
      port: Number(process.env.MYSQL_PORT ?? 3306),
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
      dateStrings: false,
    })
  }

  return globalForDb.mysqlPool
}

function toPostgresPlaceholders(sql: string) {
  let index = 0
  return sql.replace(/\?/g, () => `$${++index}`)
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  values: unknown[] = [],
): Promise<QueryResult<T>> {
  if (getDriver() === 'postgres') {
    const result = await getPostgresPool().query<T>(toPostgresPlaceholders(sql), values)
    return { rows: result.rows, rowCount: result.rowCount ?? result.rows.length }
  }

  const [rows] = await getMySQLPool().query(sql, values as never[])
  if (Array.isArray(rows)) {
    return { rows: rows as T[], rowCount: rows.length }
  }

  const result = rows as ResultSetHeader
  return { rows: [], rowCount: result.affectedRows ?? 0 }
}
