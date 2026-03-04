import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const runSchema = async () => {
  try {
    const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('✅ Schema applied successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Schema error:', err.message);
    process.exit(1);
  }
};

runSchema();
