import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.aurl);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all migration files
    const migrationFiles = await fs.readdir(__dirname);
    const sqlFiles = migrationFiles.filter(file => 
      file.endsWith('.js') && file !== 'run.js'
    );

    // Sort files by timestamp
    sqlFiles.sort();

    // Execute each migration
    for (const file of sqlFiles) {
      try {
        const migration = await import(`./${file}`);
        await migration.up();
        console.log(`Successfully ran migration: ${file}`);
      } catch (error) {
        console.error(`Error running migration ${file}:`, error);
        process.exit(1);
      }
    }

    console.log('All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

runMigrations();