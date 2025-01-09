import { PropertyType, FacilityType } from '@/types/property';

// Define property types as a constant array
export const PROPERTY_TYPES: PropertyType[] = [
    "House",
    "Townhouse",
    "Condo",
    "Duplex",
    "Studio",
    "Villa",
    "Apartment",
    "Other"
] as const;

// Define facility types as a constant array
export const FACILITY_TYPES: FacilityType[] = [
    "Wifi",
    "Gym",
    "Car Parking",
    "Swimming pool",
    "Laundry",
    "Pet Center",
    "Sports Center",
    "Cutlery"
] as const;

// Price range boundaries for filtering
export const PRICE_RANGES = {
    BUDGET: {
        min: 0,
        max: 100000,
        label: 'Under $100k'
    },
    MID_RANGE: {
        min: 100000,
        max: 300000,
        label: '$100k - $300k'
    },
    LUXURY: {
        min: 300000,
        max: 1000000,
        label: '$300k - $1M'
    },
    ULTRA_LUXURY: {
        min: 1000000,
        max: Infinity,
        label: 'Over $1M'
    }
} as const;