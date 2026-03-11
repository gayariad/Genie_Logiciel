import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null

export function useDB() {
  if (!pool) {
    const config = useRuntimeConfig()
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: true,
      connectionLimit: 10,
    })
  }
  return pool
}
