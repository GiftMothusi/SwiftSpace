// lib/seed.ts
import { Client, Databases, ID } from 'node-appwrite';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Determine the correct .env file path
const envFilePath = path.resolve(__dirname, '../.env.local');
const fallbackEnvPath = path.resolve(__dirname, '../.env');

// Load environment variables with fallback
if (fs.existsSync(envFilePath)) {
    dotenv.config({ path: envFilePath });
} else if (fs.existsSync(fallbackEnvPath)) {
    dotenv.config({ path: fallbackEnvPath });
}

// Validate required environment variables
const requiredEnvVars = {
    EXPO_PUBLIC_APPWRITE_ENDPOINT: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    EXPO_PUBLIC_APPWRITE_PROJECT_ID: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    EXPO_PUBLIC_APPWRITE_DATABASE_ID: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID: process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID,
    EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID: process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID,
    EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID: process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID,
    EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID: process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID,
    APPWRITE_API_KEY: process.env.APPWRITE_API_KEY
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(variable => console.error(`   - ${variable}`));
    
    // Print all current environment variables for debugging
    console.log('\n🔍 Current Environment Variables:');
    Object.entries(process.env).forEach(([key, value]) => {
        if (key.includes('APPWRITE') || key.includes('EXPO')) {
            console.log(`${key}: ${value}`);
        }
    });

    throw new Error('Missing required environment variables');
}

console.log('✅ All environment variables loaded successfully');

// Initialize the Appwrite client
const client = new Client()
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;

const COLLECTIONS = {
    AGENTS: process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID!,
    PROPERTIES: process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID!,
    GALLERIES: process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID!,
    REVIEWS: process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID!
} as const;

// Print configuration for debugging
console.log('\n📋 Configuration:');
console.log(`Database ID: ${DATABASE_ID}`);
console.log('Collection IDs:');
Object.entries(COLLECTIONS).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
});

// Sample data
const agentImages = [
    "https://images.unsplash.com/photo-1560184897-ae75f418493e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"
];

const propertyImages = [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1576941089067-2de3c901e126?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"
];

const propertyTypes = ["House", "Townhouse", "Condo", "Duplex", "Studio", "Villa", "Apartment", "Other"];
const propertyStatuses = ["Available", "Rented", "Sold", "Under-Contract"];
const facilities = ["Laundry", "Parking", "Gym", "Wifi", "Pet-friendly"];

function getRandomSubset<T>(array: T[], minItems: number, maxItems: number): T[] {
    const size = Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems;
    return [...array].sort(() => Math.random() - 0.5).slice(0, size);
}

async function cleanupCollection(collectionId: string) {
    if (!collectionId) {
        console.log(`⚠️ Skipping cleanup for undefined collection ID`);
        return;
    }

    try {
        console.log(`🧹 Cleaning up collection: ${collectionId}`);
        const documents = await databases.listDocuments(DATABASE_ID, collectionId);
        
        await Promise.all(
            documents.documents.map(doc => 
                databases.deleteDocument(DATABASE_ID, collectionId, doc.$id)
            )
        );
        console.log(`✅ Cleaned up collection: ${collectionId}`);
    } catch (error) {
        console.error(`❌ Error cleaning collection ${collectionId}:`, error);
        throw error;
    }
}

async function seed() {
    try {
        // Cleanup existing data
        console.log("🚀 Starting database cleanup...");
        for (const [key, collectionId] of Object.entries(COLLECTIONS)) {
            console.log(`🔄 Processing ${key}...`);
            await cleanupCollection(collectionId);
        }

        // Seed Agents
        console.log("\n👥 Seeding agents...");
        const agents = await Promise.all(
            Array(5).fill(null).map(async (_, i) => {
                return databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.AGENTS,
                    ID.unique(),
                    {
                        name: `Agent ${i + 1}`,
                        email: `agent${i + 1}@example.com`,
                        avatar: agentImages[i % agentImages.length]
                    }
                );
            })
        );
        console.log(`✅ Created ${agents.length} agents`);

        // Seed Reviews
        console.log("\n⭐️ Seeding reviews...");
        const reviews = await Promise.all(
            Array(15).fill(null).map(async (_, i) => {
                return databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.REVIEWS,
                    ID.unique(),
                    {
                        name: `Reviewer ${i + 1}`,
                        avatar: agentImages[i % agentImages.length],
                        review: `Great property with excellent amenities and location. The service was outstanding!`,
                        rating: Math.floor(Math.random() * 2) + 4 // 4 or 5 stars
                    }
                );
            })
        );
        console.log(`✅ Created ${reviews.length} reviews`);

        // Seed Properties
        console.log("\n🏠 Seeding properties...");
        for (let i = 1; i <= 10; i++) {
            const selectedFacilities = getRandomSubset(facilities, 2, 4);
            const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
            const status = propertyStatuses[Math.floor(Math.random() * propertyStatuses.length)];
            const assignedReviews = getRandomSubset(reviews, 2, 4);
            
            await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.PROPERTIES,
                ID.unique(),
                {
                    name: `Beautiful ${propertyType} ${i}`,
                    type: propertyType,
                    status: status,
                    description: `Stunning ${propertyType.toLowerCase()} with modern amenities. Features high ceilings, natural light, and an open floor plan.`,
                    address: `${Math.floor(Math.random() * 9999) + 1} ${['Maple', 'Oak', 'Pine', 'Cedar'][i % 4]} Street`,
                    price: (Math.floor(Math.random() * 900) + 100) * 1000,
                    area: Math.floor(Math.random() * 3000) + 1000,
                    bedrooms: Math.floor(Math.random() * 5) + 1,
                    bathrooms: Math.floor(Math.random() * 3) + 1,
                    rating: (Math.floor(Math.random() * 20) + 30) / 10,
                    facilities: selectedFacilities,
                    image: propertyImages[i % propertyImages.length],
                    agent: agents[i % agents.length].$id,
                    gallery: [],
                    reviews: assignedReviews.map(review => review.$id)
                }
            );
            console.log(`✅ Created property ${i}/10`);
        }

        console.log("\n✨ Seeding completed successfully!");
    } catch (error) {
        console.error("\n❌ Error seeding data:", error);
        throw error;
    }
}

export default seed;