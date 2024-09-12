import { useContext } from 'react'
import { DatabaseContext } from '../contexts/DatabaseContext'

export function useDatabaseContext() {
  const context = useContext(DatabaseContext)
  if (!context) {
    throw new Error('useDatabaseContext must be used within a DatabaseProvider')
  }
  return context
}