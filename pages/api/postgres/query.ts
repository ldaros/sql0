import { NextApiRequest, NextApiResponse } from 'next'
import { getDatabase } from '../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { query } = req.body

  if (!query) {
    return res.status(400).json({ error: 'Query is required' })
  }

  try {
    const db = getDatabase()
    const result = await db.query(query)

    if (Array.isArray(result)) {
      const lastResult = result[result.length - 1];
      res.status(200).json({ result: lastResult.rows });
      return;
    }

    res.status(200).json({ result: result.rows })
  } catch (error) {
    console.error('Error executing query:', error)
    if (error instanceof Error) {
      res.status(500).json({ error: 'Error executing query', cause: error.message })
    } else {
      res.status(500).json({ error: 'Error executing query', cause: 'Unknown error' })
    }
  }
}