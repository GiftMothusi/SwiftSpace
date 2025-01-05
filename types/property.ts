// Define the main property interface that represents a real estate property
export interface Property {
    $id?: string;  // Optional ID field for new properties
    name: string;  // Property name/title
    type: PropertyType;  // Type of property (house, condo, etc.)
    status: PropertyStatus;  // Current status of the property
    description: string;  // Detailed property description
    address: string;  // Property location address
    price: number;  // Property price
    bedrooms: number;  // Number of bedrooms
    bathrooms: number;  // Number of bathrooms
    area: number;  // Property area in square feet
    facilities: string[];  // Array of available facilities
    images: string[];  // Array of image URLs
    agent: string;  // Reference to the agent ID
    createdAt?: string;  // Timestamp of creation
    updatedAt?: string;  // Timestamp of last update
    
  }
  
// Define all possible property types
export type PropertyType = 
    | "House"
    | "Townhouse"
    | "Condo"
    | "Duplex"
    | "Studio"
    | "Villa"
    | "Apartment"
    | "Other";

// Define all possible property status values
export type PropertyStatus = 
    | "Available"
    | "Sold"
    | "Under-Contract"
    | "Rented";

export const PropertyStatusColors = {
    Available: "bg-green-500",
    Rented: "bg-blue-500",
    Sold: "bg-red-500",
    "Under-Contract": "bg-yellow-500"
} as const;