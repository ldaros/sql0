import { NextApiRequest, NextApiResponse } from 'next'
import { getDatabase } from '../../../lib/db'
import { DatabaseConfig } from '../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDatabase()

  if (req.method === 'GET') {
    try {
      const config = db.getConfig()
      res.status(200).json(config)
    } catch (error) {
      console.error('Error fetching database settings:', error)
      res.status(500).json({ error: 'Error fetching database settings' })
    }
  } else if (req.method === 'POST') {
    try {
      const newConfig: Partial<DatabaseConfig> = req.body
      await db.updateConfig(newConfig)
      res.status(200).json({ message: 'Database settings updated successfully' })
    } catch (error) {
      console.error('Error updating database settings:', error)
      if (error instanceof Error) {
        res.status(500).json({ error: 'Error updating database settings', cause: error.message })
      } else {
        res.status(500).json({ error: 'Error updating database settings', cause: 'Unknown error' })
      }
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
