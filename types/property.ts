// Location coordinates interface
export interface Coordinates {
    latitude: number;  // Float type in Appwrite
    longitude: number; // Float type in Appwrite
  }
  
  // Price range options
  export enum PriceRange {
    BUDGET = 'budget',          // < $100,000
    MID_RANGE = 'mid_range',    // $100,000 - $300,000
    LUXURY = 'luxury',          // $300,000 - $1,000,000
    ULTRA_LUXURY = 'ultra_luxury' // > $1,000,000
  }
  
  // Available facilities in properties
  export enum FacilityType {
    WIFI = 'Wifi',
    GYM = 'Gym',
    PARKING = 'Car Parking',
    POOL = 'Swimming pool',
    LAUNDRY = 'Laundry',
    PET_CENTER = 'Pet Center',
    SPORTS_CENTER = 'Sports Center',
    CUTLERY = 'Cutlery'
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
  
  // Property search filters interface
  export interface PropertySearchFilters {
    priceMin?: number;
    priceMax?: number;
    location?: Coordinates;
    radiusKm?: number;
    propertyType?: PropertyType;
    facilities?: FacilityType[];
    status?: PropertyStatus;
    query?: string;  // Added for text search
  }
  
  // Define the main property interface
  export interface Property {
    $id?: string;
    name: string;
    type: PropertyType;
    status: PropertyStatus;
    description: string;
    address: string;
    price: number;
    priceRange: PriceRange;
    location: Coordinates;
    bedrooms: number;
    bathrooms: number;
    area: number;
    facilities: FacilityType[];
    images: string[];
    agent: string;
    rating: number;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export const PropertyStatusColors = {
    Available: "bg-green-500",
    Rented: "bg-blue-500",
    Sold: "bg-red-500",
    "Under-Contract": "bg-yellow-500"
  } as const;
  
  // Helper function to determine price range
  export function determinePriceRange(price: number): PriceRange {
    if (price < 100000) return PriceRange.BUDGET;
    if (price < 300000) return PriceRange.MID_RANGE;
    if (price < 1000000) return PriceRange.LUXURY;
    return PriceRange.ULTRA_LUXURY;
  }