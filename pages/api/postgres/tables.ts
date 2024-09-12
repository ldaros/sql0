import { NextApiRequest, NextApiResponse } from 'next'
import { getDatabase } from '../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = getDatabase()
    const tablesResult = await db.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    )
    const tables = tablesResult.rows.map(row => row.table_name)

    const databaseNameResult = await db.query('SELECT current_database()')
    const databaseName = databaseNameResult.rows[0].current_database

    const tablesWithColumns = await Promise.all(tables.map(async (tableName) => {
      const columnsResult = await db.query(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
        [tableName]
      )
      const columns = columnsResult.rows.map(row => row.column_name)
      return { tableName, columns }
    }))

    res.status(200).json({ tables: tablesWithColumns, databaseName })
  } catch (error) {
    console.error('Error fetching tables, columns, and database name:', error)
    res.status(500).json({ error: 'Error fetching tables, columns, and database name' })
  }
}