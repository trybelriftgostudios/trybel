import pkg from 'pg';
const { Pool } = pkg;

export class PostgresService {
  private static pool: pkg.Pool | null = null;
  private static isConnected: boolean = false;

  public static getPool(): pkg.Pool {
    if (!this.pool) {
      const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/trybel_db';
      
      this.pool = new Pool({
        connectionString,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 3000,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
      });

      this.pool.on('error', (err) => {
        console.warn(`[PostgreSQL Pool] Idle client error (switched to resilient local snapshot cache): ${err.message}`);
        this.isConnected = false;
      });
    }

    return this.pool;
  }

  /**
   * Health check to see if live PostgreSQL connection is active
   */
  public static async checkConnection(): Promise<boolean> {
    try {
      const pool = this.getPool();
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      this.isConnected = true;
      return true;
    } catch (err: any) {
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Executes a SQL query with parameters.
   */
  public static async query<T extends pkg.QueryResultRow = any>(text: string, params?: any[]): Promise<pkg.QueryResult<T>> {
    const pool = this.getPool();
    return pool.query<T>(text, params);
  }

  public static isDatabaseConnected(): boolean {
    return this.isConnected;
  }

  public static async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
    }
  }
}
