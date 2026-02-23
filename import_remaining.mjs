import fs from 'fs';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

async function main() {
  console.log('Connecting to database...');
  const connection = await mysql.createConnection(DATABASE_URL);

  const tables = ['competencies', 'departments', 'programs', 'plos', 'mappings'];
  
  for (const table of tables) {
    const sqlFile = `/tmp/${table}.sql`;
    if (fs.existsSync(sqlFile)) {
      console.log(`Importing ${table}...`);
      const sql = fs.readFileSync(sqlFile, 'utf-8');
      try {
        await connection.query('SET FOREIGN_KEY_CHECKS=0');
        await connection.query(sql);
        await connection.query('SET FOREIGN_KEY_CHECKS=1');
        console.log(`  ✓ ${table} imported successfully`);
      } catch (error) {
        console.error(`  ✗ Error importing ${table}:`, error.message);
      }
    } else {
      console.log(`  Skipping ${table} (file not found)`);
    }
  }

  await connection.end();
  console.log('Done!');
}

main().catch(console.error);
