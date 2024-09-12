import { Pool, PoolConfig } from 'pg'
import fs from 'fs'
import path from 'path'

const CONFIG_FILE_PATH = path.join(process.cwd(), 'db-config.json')

const defaultConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'db1',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
}

export interface DatabaseConfig extends PoolConfig {
  database: string;
}

class Database {
  private static instance: Database
  private pool: Pool
  private config: DatabaseConfig

  private constructor(config?: DatabaseConfig) {
    this.config = this.loadConfig(config)
    this.pool = new Pool(this.config)
  }

  private loadConfig(config?: DatabaseConfig): DatabaseConfig {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const savedConfig = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf8'))
      return { ...defaultConfig, ...savedConfig, ...config }
    }
    return config || defaultConfig
  }

  private saveConfig() {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(this.config, null, 2))
  }

  public static getInstance(config?: DatabaseConfig): Database {
    if (!Database.instance) {
      Database.instance = new Database(config)
    }
    return Database.instance
  }

  public getConfig(): DatabaseConfig {
    return { ...this.config }
  }

  public async updateConfig(newConfig: Partial<DatabaseConfig>): Promise<void> {
    await this.end()
    this.config = { ...this.config, ...newConfig }
    this.pool = new Pool(this.config)
    this.saveConfig()
  }

  public async query(sql: string, params?: any[]) {
    const client = await this.pool.connect()
    try {
      return await client.query(sql, params)
    } finally {
      client.release()
    }
  }

  public async end() {
    await this.pool.end()
  }
}

// Don't create an instance immediately
export const getDatabase = Database.getInstance