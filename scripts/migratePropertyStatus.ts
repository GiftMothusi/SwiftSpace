import { databases, config } from "../lib/appwrite";

const migrateExistingProperties = async () => {
  try {
    console.log('Starting property status migration...');
    
    const properties = await databases.listDocuments(
      config.databaseId!,
      config.propertiesCollectionId!
    );

    console.log(`Found ${properties.documents.length} properties to check`);
    let updatedCount = 0;

    for (const property of properties.documents) {
      if (!property.status) {
        await databases.updateDocument(
          config.databaseId!,
          config.propertiesCollectionId!,
          property.$id,
          { status: 'Available' }
        );
        updatedCount++;
        console.log(`Updated property ${property.$id} with status Available`);
      }
    }

    console.log(`Migration completed. Updated ${updatedCount} properties.`);
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

export default migrateExistingProperties;