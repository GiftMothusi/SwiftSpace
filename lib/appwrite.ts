import {
    Client,
    Account,
    ID,
    Databases,
    OAuthProvider,
    Avatars,
    Query,
    Storage,
  } from "react-native-appwrite";
  import * as Linking from "expo-linking";
  import { openAuthSessionAsync } from "expo-web-browser";
  import { Property } from "@/types/property";
  import { Booking, BookingStatus, BookingType } from '@/types/booking';
  
  
  export const config = {
    platform: "swiftspace",
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    galleriesCollectionId:
      process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID,
    reviewsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID,
    agentsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID,
    propertiesCollectionId:
      process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID,
    favoritesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_FAVORITES_COLLECTION_ID,
    bookingsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_BOOKINGS_COLLECTION_ID,
    bucketId: process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID,
  };
  
  export const client = new Client();
  client
    .setEndpoint(config.endpoint!)
    .setProject(config.projectId!)
    .setPlatform(config.platform!);
  
  export const avatar = new Avatars(client);
  export const account = new Account(client);
  export const databases = new Databases(client);
  export const storage = new Storage(client);
  
  export async function login() {
    try {
      const redirectUri = Linking.createURL("/");
  
      const response = await account.createOAuth2Token(
        OAuthProvider.Google,
        redirectUri
      );
      if (!response) throw new Error("Create OAuth2 token failed");
  
      const browserResult = await openAuthSessionAsync(
        response.toString(),
        redirectUri
      );
      if (browserResult.type !== "success")
        throw new Error("Create OAuth2 token failed");
  
      const url = new URL(browserResult.url);
      const secret = url.searchParams.get("secret")?.toString();
      const userId = url.searchParams.get("userId")?.toString();
      if (!secret || !userId) throw new Error("Create OAuth2 token failed");
  
      const session = await account.createSession(userId, secret);
      if (!session) throw new Error("Failed to create session");
  
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  
  export async function logout() {
    try {
      const result = await account.deleteSession("current");
      return result;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  
  export async function getCurrentUser() {
    try {
      const result = await account.get();
      if (result.$id) {
        const userAvatar = avatar.getInitials(result.name);
  
        return {
          ...result,
          avatar: userAvatar.toString(),
        };
      }
  
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  
  export async function getLatestProperties() {
    try {
      const result = await databases.listDocuments(
        config.databaseId!,
        config.propertiesCollectionId!,
        [Query.orderAsc("$createdAt"), Query.limit(5)]
      );
  
      return result.documents;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  
  export async function getProperties({
    filter,
    status,
    query,
    limit,
  }: {
    filter: string;
    status?: string;
    query: string;
    limit?: number;
  }) {
    try {
      const buildQuery = [Query.orderDesc("$createdAt")];
  
      if (filter && filter !== "All")
        buildQuery.push(Query.equal("type", filter));
      
      if (status)
        buildQuery.push(Query.equal("status", status));
  
      if (query)
        buildQuery.push(
          Query.or([
            Query.search("name", query),
            Query.search("address", query),
            Query.search("type", query),
          ])
        );
  
      if (limit) buildQuery.push(Query.limit(limit));
  
      const result = await databases.listDocuments(
        config.databaseId!,
        config.propertiesCollectionId!,
        buildQuery
      );
  
      return result.documents;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  
  // write function to get property by id
  export async function getPropertyById({ id }: { id: string }) {
    try {
      const result = await databases.getDocument(
        config.databaseId!,
        config.propertiesCollectionId!,
        id
      );
      return result;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  export async function createProperty(propertyData: Property, images: Array<{uri: string; type: string; name: string; size: number}>) {
    try {
        // First handle image uploads
        const imageUrls = await Promise.all(
            images.map(async (image) => {
                const fileId = ID.unique();
                await storage.createFile(
                    config.bucketId!,
                    fileId,
                    image // Now image has the correct type
                );
                
                const fileUrl = storage.getFileView(
                    config.bucketId!,
                    fileId
                );
                
                return fileUrl.toString();
            })
        );

        // Create the property document with uploaded image URLs
        const property = await databases.createDocument(
            config.databaseId!,
            config.propertiesCollectionId!,
            ID.unique(),
            {
                ...propertyData,
                images: imageUrls,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
        );

        return property;
    } catch (error) {
        console.error('Error creating property:', error);
        throw error;
    }
}
  
  // Function to update an existing property
  export async function updateProperty(
    propertyId: string, 
    propertyData: Partial<Property>,
    newImages?: Array<{
        uri: string;
        type: string;
        name: string;
        size: number;
    }>
) {
    try {
        let imageUrls = propertyData.images || [];

        // Handle any new images that need to be uploaded
        if (newImages?.length) {
            const newImageUrls = await Promise.all(
                newImages.map(async (image) => {
                    const fileId = ID.unique();
                    await storage.createFile(
                        config.bucketId!,
                        fileId,
                        {
                            uri: image.uri,
                            type: image.type,
                            name: image.name,
                            size: image.size
                        }
                    );
                    
                    const fileUrl = storage.getFileView(
                        config.bucketId!,
                        fileId
                    );
                    
                    return fileUrl.toString();
                })
            );
            
            imageUrls = [...imageUrls, ...newImageUrls];
        }

        // Update the property document
        const property = await databases.updateDocument(
            config.databaseId!,
            config.propertiesCollectionId!,
            propertyId,
            {
                ...propertyData,
                images: imageUrls,
                updatedAt: new Date().toISOString(),
            }
        );

        return property;
    } catch (error) {
        console.error('Error updating property:', error);
        throw error;
    }
}
  
  // Function to delete a property and its associated images
  export async function deleteProperty(propertyId: string) {
    try {
        const property = await getPropertyById({ id: propertyId });
        
        // Delete all associated images from storage
        if (property?.images?.length) {
            await Promise.all(
                property.images.map(async (imageUrl: string) => {
                    const fileId = imageUrl.split('/').pop()!;
                    await storage.deleteFile(config.bucketId!, fileId);
                })
            );
        }

        await databases.deleteDocument(
            config.databaseId!,
            config.propertiesCollectionId!,
            propertyId
        );

        return true;
    } catch (error) {
        console.error('Error deleting property:', error);
        throw error;
    }
}

  export async function addToFavorites(propertyId: string, userId: string) {
    try {
      const result = await databases.createDocument(
        config.databaseId!,
        config.favoritesCollectionId!,
        ID.unique(),
        {
          user_id: userId,
          property_id: propertyId,
          created_at: new Date().toISOString(),
        }
      );
      return result;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return null;
    }
  }

  export async function removeFromFavorites(favoriteId: string) {
    try {
      await databases.deleteDocument(
        config.databaseId!,
        config.favoritesCollectionId!,
        favoriteId
      );
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  }
  
  export async function getFavorites(userId: string) {
    try {
      const result = await databases.listDocuments(
        config.databaseId!,
        config.favoritesCollectionId!,
        [Query.equal('user_id', userId)]
      );
      return result.documents;
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }
  
  export async function checkIsFavorite(propertyId: string, userId: string) {
    try {
      const result = await databases.listDocuments(
        config.databaseId!,
        config.favoritesCollectionId!,
        [
          Query.equal('user_id', userId),
          Query.equal('property_id', propertyId),
        ]
      );
      return result.documents.length > 0 ? result.documents[0] : null;
    } catch (error) {
      console.error('Error checking favorite:', error);
      return null;
    }
  }

  export async function createBooking({
    property_id,
    agent_id,
    booking_type,
    date,
    time_slot,
    notes
}: {
    property_id: string;
    agent_id: string;
    booking_type: BookingType;
    date: string;
    time_slot: string;
    notes?: string;
}) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const booking = await databases.createDocument(
            config.databaseId!,
            config.bookingsCollectionId!, // Changed from BOOKINGS_COLLECTION_ID
            ID.unique(),
            {
                property_id,
                agent_id,
                user_id: user.$id,
                booking_type,
                status: 'pending',
                date,
                time_slot,
                notes,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        );

        return booking;
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
}

export async function getUserBookings(status?: BookingStatus) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const queries = [Query.equal('user_id', user.$id)];
        if (status) {
            queries.push(Query.equal('status', status));
        }

        const result = await databases.listDocuments(
            config.databaseId!,
            config.bookingsCollectionId!, // Changed from BOOKINGS_COLLECTION_ID
            queries
        );

        return result.documents;
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        throw error;
    }
}

export async function updateBookingStatus(
    bookingId: string,
    status: BookingStatus
) {
    try {
        const booking = await databases.updateDocument(
            config.databaseId!,
            config.bookingsCollectionId!, // Changed from BOOKINGS_COLLECTION_ID
            bookingId,
            {
                status,
                updated_at: new Date().toISOString()
            }
        );

        return booking;
    } catch (error) {
        console.error('Error updating booking status:', error);
        throw error;
    }
}

export async function checkTimeSlotAvailability(
    property_id: string,
    date: string,
    time_slot: string
) {
    try {
        const result = await databases.listDocuments(
            config.databaseId!,
            config.bookingsCollectionId!, // Changed from BOOKINGS_COLLECTION_ID
            [
                Query.equal('property_id', property_id),
                Query.equal('date', date),
                Query.equal('time_slot', time_slot),
                Query.notEqual('status', 'cancelled')
            ]
        );

        return result.documents.length === 0;
    } catch (error) {
        console.error('Error checking time slot availability:', error);
        throw error;
    }
}