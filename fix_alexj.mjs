import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { eq } from 'drizzle-orm';
import { athletes } from './drizzle/schema.js';
import bcrypt from 'bcryptjs';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(conn);

// Delete the old alexj record (soft-deleted)
await db.delete(athletes).where(eq(athletes.username, 'alexj'));
console.log('Deleted old alexj record');

// Create fresh alexj
const hash = await bcrypt.hash('athlete123', 12);
await db.insert(athletes).values({
  name: 'Alex Johnson',
  username: 'alexj',
  passwordHash: hash,
  role: 'athlete',
  sportMode: 'track',
  isActive: true,
});
console.log('Created fresh alexj with password: athlete123');

// Verify
const all = await db.select().from(athletes);
console.log('All athletes:', all.map(a => `${a.username} (${a.name})`).join(', '));

await conn.end();
