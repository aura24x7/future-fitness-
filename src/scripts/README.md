# Future Fitness Scripts

This directory contains utility scripts for the Future Fitness application.

## Username Migration

The username migration script is used to generate usernames for all existing users who don't have one.

### Command Line Usage

To run the migration from the command line:

```bash
# Navigate to the project root
cd /path/to/future-fitness

# Run the script
npx ts-node src/scripts/runMigration.ts
```

This will prompt for confirmation and then migrate all users without usernames.

### Application Usage

The migration can also be triggered from within the application using the AdminService:

```typescript
import { adminService } from '../services/adminService';

// Example: Running migration from an admin screen
async function runMigration() {
  try {
    const result = await adminService.runUsernameMigration();
    
    if (result.success) {
      console.log('Migration completed successfully!');
      console.log(`Migrated ${result.stats?.migrated} users`);
    } else {
      console.error('Migration failed:', result.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

Note: This functionality is only available to admin users.

## Migration Process

The migration process:

1. Fetches all user documents from Firestore
2. For each user without a username:
   - Generates a unique username based on their display name or email
   - Updates the user document with the new username
   - Creates a corresponding document in the 'usernames' collection
3. Returns statistics about the migration

## Customization

You can modify the migration process in `migrateExistingUsers.ts` if you need to change:

- The source of username generation (e.g., prioritize different fields)
- The format of generated usernames
- Error handling behavior
- Batch size or other performance optimizations 