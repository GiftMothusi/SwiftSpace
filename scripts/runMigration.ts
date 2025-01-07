// scripts/runMigration.ts
import seed from '../lib/seed';

console.log("🌱 Starting database seeding process...");
seed()
    .then(() => {
        console.log("✅ Database seeding completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Database seeding failed:", error);
        process.exit(1);
    });