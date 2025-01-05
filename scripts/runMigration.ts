import migrateExistingProperties from './migratePropertyStatus';

console.log('Starting migration script...');

migrateExistingProperties()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });