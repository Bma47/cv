import { Pool } from 'pg'
import { createPool } from 'mysql2/promise'

const required = ['PGDATABASE', 'PGUSER', 'PGPASSWORD', 'MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD']
const missing = required.filter((name) => !process.env[name])
if (missing.length) {
  throw new Error(`Missing migration environment variables: ${missing.join(', ')}`)
}

const postgres = new Pool({
  host: process.env.PGHOST ?? '127.0.0.1',
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
})

const maria = createPool({
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: Number(process.env.MYSQL_PORT ?? 3306),
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 2,
})

let connection
try {
  const [users, cvs] = await Promise.all([
    postgres.query('SELECT id::text, email, password_hash, created_at FROM app_users ORDER BY created_at'),
    postgres.query(`SELECT id::text, user_id::text, title, language, template, data, theme_settings,
      photo_url, background_url, created_at, updated_at FROM cvs ORDER BY created_at`),
  ])

  connection = await maria.getConnection()
  const [userCount] = await connection.query('SELECT COUNT(*) AS count FROM app_users')
  const [sessionCount] = await connection.query('SELECT COUNT(*) AS count FROM app_sessions')
  const [cvCount] = await connection.query('SELECT COUNT(*) AS count FROM cvs')
  if (Number(userCount[0].count) || Number(sessionCount[0].count) || Number(cvCount[0].count)) {
    throw new Error('Target MariaDB tables are not empty. Migration stopped without changing data.')
  }

  await connection.beginTransaction()
  for (const user of users.rows) {
    await connection.execute(
      'INSERT INTO app_users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
      [user.id, user.email, user.password_hash, user.created_at],
    )
  }
  for (const cv of cvs.rows) {
    await connection.execute(
      `INSERT INTO cvs
        (id, user_id, title, language, template, data, theme_settings, photo_url, background_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cv.id,
        cv.user_id,
        cv.title,
        cv.language,
        cv.template,
        JSON.stringify(cv.data),
        JSON.stringify(cv.theme_settings),
        cv.photo_url,
        cv.background_url,
        cv.created_at,
        cv.updated_at,
      ],
    )
  }
  await connection.commit()
  console.log(`Copied ${users.rowCount} accounts and ${cvs.rowCount} CVs. Existing PostgreSQL data was left unchanged.`)
  console.log('Sessions were not copied; users will sign in again on the new domain.')
} catch (error) {
  if (connection) await connection.rollback().catch(() => undefined)
  throw error
} finally {
  connection?.release()
  await maria.end()
  await postgres.end()
}
