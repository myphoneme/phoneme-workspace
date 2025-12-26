import { Pool, PoolClient, QueryResult } from 'pg';

const pool = new Pool({
  host: '10.100.60.113',
  port: 5432,
  user: 'postgres',
  password: 'indian@123',
  database: 'phoneme-workspace',
});

// Test connection on startup
pool.connect()
  .then((client: PoolClient) => {
    console.log('Connected to PostgreSQL database');
    client.release();
  })
  .catch((err: Error) => {
    console.error('Failed to connect to PostgreSQL:', err.message);
  });

// Direct query function for PostgreSQL-style queries (with $1, $2 placeholders)
export async function query<T extends Record<string, any> = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
  return pool.query<T>(sql, params);
}

// Helper class to provide a similar API to better-sqlite3
class Database {
  prepare(sql: string) {
    return {
      // Get single row
      get: async (...params: any[]): Promise<any> => {
        const result = await pool.query(this.convertPlaceholders(sql), params);
        return result.rows[0];
      },
      // Get all rows
      all: async (...params: any[]): Promise<any[]> => {
        const result = await pool.query(this.convertPlaceholders(sql), params);
        return result.rows;
      },
      // Run insert/update/delete
      run: async (...params: any[]): Promise<{ lastInsertRowid: number; changes: number }> => {
        // For INSERT statements, add RETURNING id to get the inserted id
        let modifiedSql = this.convertPlaceholders(sql);
        const isInsert = sql.trim().toUpperCase().startsWith('INSERT');

        if (isInsert && !modifiedSql.toUpperCase().includes('RETURNING')) {
          modifiedSql = modifiedSql.replace(/;?\s*$/, ' RETURNING id');
        }

        const result = await pool.query(modifiedSql, params);
        return {
          lastInsertRowid: result.rows[0]?.id || 0,
          changes: result.rowCount || 0,
        };
      },
    };
  }

  // Convert SQLite ? placeholders to PostgreSQL $1, $2, etc.
  private convertPlaceholders(sql: string): string {
    let index = 0;
    return sql.replace(/\?/g, () => `$${++index}`);
  }

  // Execute raw SQL (for migrations, etc.)
  async exec(sql: string): Promise<void> {
    await pool.query(sql);
  }

  // Get the underlying pool for advanced usage
  getPool(): Pool {
    return pool;
  }
}

const db = new Database();

export default db;
export { pool };
