#!/usr/bin/env node

import { runUsernameMigration } from './migrateExistingUsers';
import { firestore } from '../firebase/firebaseInit';

/**
 * This script runs the username migration for all users.
 * It should be run after the username system has been fully implemented.
 * 
 * Usage:
 * npx ts-node src/scripts/runMigration.ts
 */
async function main() {
  console.log('=== Future Fitness Username Migration ===');
  console.log('This script will assign usernames to all users who don\'t have one.');
  
  // Simple confirmation using command line
  process.stdout.write('Are you sure you want to proceed? (y/n): ');
  
  // Read input from stdin
  process.stdin.once('data', async (data) => {
    const input = data.toString().trim().toLowerCase();
    
    if (input === 'y' || input === 'yes') {
      console.log('\nStarting migration...');
      const result = await runUsernameMigration();
      
      if (result.success) {
        console.log('\nMigration completed successfully!');
        if (result.stats) {
          console.log(`Total users: ${result.stats.total}`);
          console.log(`Migrated: ${result.stats.migrated}`);
          console.log(`Skipped (already had username): ${result.stats.skipped}`);
          console.log(`Errors: ${result.stats.errors}`);
        }
      } else {
        console.error('\nMigration failed:', result.error);
      }
    } else {
      console.log('\nMigration cancelled.');
    }
    
    process.exit(0);
  });
}

main().catch(error => {
  console.error('Unexpected error during migration:', error);
  process.exit(1);
}); 