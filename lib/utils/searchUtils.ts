import { Coordinates, Property, PropertySearchFilters } from '@/types/property';

// Calculate distance between two coordinates using the Haversine formula
export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(point1.latitude)) * Math.cos(toRad(point2.latitude)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

// Convert degrees to radians
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Check if a property is within the specified radius of a location
export function isWithinRadius(
  propertyLocation: Coordinates,
  searchLocation: Coordinates,
  radiusKm: number
): boolean {
  const distance = calculateDistance(propertyLocation, searchLocation);
  return distance <= radiusKm;
}

// Filter properties based on search criteria
export function filterProperties(
  properties: Property[],
  filters: PropertySearchFilters
): Property[] {
  return properties.filter(property => {
    // Price range filter
    if (filters.priceMin && property.price < filters.priceMin) {
      return false;
    }
    if (filters.priceMax && property.price > filters.priceMax) {
      return false;
    }

    // Location filter
    if (filters.location && filters.radiusKm) {
      if (!isWithinRadius(property.location, filters.location, filters.radiusKm)) {
        return false;
      }
    }

    // Property type filter
    if (filters.propertyType && property.type !== filters.propertyType) {
      return false;
    }

    // Facilities filter
    if (filters.facilities && filters.facilities.length > 0) {
      const hasAllFacilities = filters.facilities.every(facility => 
        property.facilities.includes(facility)
      );
      if (!hasAllFacilities) {
        return false;
      }
    }

    // Status filter
    if (filters.status && property.status !== filters.status) {
      return false;
    }

    return true;
  });
}

// Format price for display
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(price);
}

// Generate price range options for the UI
export function getPriceRangeOptions(): { min: number; max: number; label: string }[] {
  return [
    { min: 0, max: 100000, label: 'Under $100k' },
    { min: 100000, max: 300000, label: '$100k - $300k' },
    { min: 300000, max: 1000000, label: '$300k - $1M' },
    { min: 1000000, max: Infinity, label: 'Over $1M' }
  ];
}