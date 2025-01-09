import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useDebouncedCallback } from 'use-debounce';

// Import types and constants
import { 
  PropertyType, 
  FacilityType,
  PropertySearchFilters 
} from '@/types/property';
import { PROPERTY_TYPES } from '@/constants/propertyContants';
import { getPriceRangeOptions } from '@/lib/utils/searchUtils';
import icons from '@/constants/icon';
import { facilities } from '@/constants/data';

// Define component props interface
interface EnhancedSearchProps {
  onSearch: (filters: PropertySearchFilters) => void;
}

export default function EnhancedSearch({ onSearch }: EnhancedSearchProps) {
  // Get URL parameters
  const params = useLocalSearchParams<{ query?: string }>();
  
  // Component state
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(params.query);
  const [filters, setFilters] = useState<PropertySearchFilters>({
    priceMin: undefined,
    priceMax: undefined,
    propertyType: undefined,
    facilities: [],
  });

  // Debounce search to prevent too many API calls
  const debouncedSearch = useDebouncedCallback((text: string) => {
    router.setParams({ query: text });
    onSearch({ ...filters, query: text });
  }, 500);

  // Handler functions
  const handleSearch = (text: string) => {
    setSearch(text);
    debouncedSearch(text);
  };

  const togglePropertyType = (type: PropertyType) => {
    setFilters(prev => ({
      ...prev,
      propertyType: prev.propertyType === type ? undefined : type
    }));
  };

  const toggleFacility = (facility: FacilityType) => {
    setFilters(prev => ({
      ...prev,
      facilities: prev.facilities?.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...(prev.facilities || []), facility]
    }));
  };

  const setPriceRange = (min?: number, max?: number) => {
    setFilters(prev => ({
      ...prev,
      priceMin: min,
      priceMax: max
    }));
  };

  const applyFilters = () => {
    onSearch(filters);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({});
    onSearch({});
    setShowFilters(false);
  };

  return (
    <View className="w-full">
      {/* Search Bar */}
      <View className="flex flex-row items-center justify-between w-full px-4 rounded-lg bg-accent-100 border border-primary-100 mt-5 py-2">
        <View className="flex-1 flex flex-row items-center justify-start">
          <Image source={icons.search} className="w-5 h-5" />
          <TextInput
            value={search}
            onChangeText={handleSearch}
            placeholder="Search by location, property name..."
            className="text-sm font-rubik text-black-300 ml-2 flex-1"
          />
        </View>

        <TouchableOpacity 
          onPress={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Image 
            source={icons.filter} 
            className="w-5 h-5"
            tintColor={Object.keys(filters).length > 0 ? '#7D9784' : undefined}
          />
          {Object.keys(filters).length > 0 && (
            <View className="absolute -top-1 -right-1 w-2 h-2 bg-primary-300 rounded-full" />
          )}
        </TouchableOpacity>
      </View>

      {/* Expandable Filters Panel */}
      {showFilters && (
        <View className="mt-4 bg-white rounded-lg shadow-lg p-4">
          {/* Price Range Filter */}
          <Text className="text-lg font-rubik-bold mb-2">Price Range</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {getPriceRangeOptions().map((range, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setPriceRange(range.min, range.max)}
                className={`mr-2 px-4 py-2 rounded-full ${
                  filters.priceMin === range.min && filters.priceMax === range.max
                    ? 'bg-primary-300'
                    : 'bg-primary-100'
                }`}
              >
                <Text className={`text-sm ${
                  filters.priceMin === range.min && filters.priceMax === range.max
                    ? 'text-white font-rubik-bold'
                    : 'text-black-300 font-rubik'
                }`}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Property Type Filter */}
          <Text className="text-lg font-rubik-bold mt-4 mb-2">Property Type</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="flex-row flex-wrap"
          >
            {PROPERTY_TYPES.map((type: PropertyType) => (
              <TouchableOpacity
                key={type}
                onPress={() => togglePropertyType(type)}
                className={`mr-2 px-4 py-2 rounded-full ${
                  filters.propertyType === type
                    ? 'bg-primary-300'
                    : 'bg-primary-100'
                }`}
              >
                <Text className={`text-sm ${
                  filters.propertyType === type
                    ? 'text-white font-rubik-bold'
                    : 'text-black-300 font-rubik'
                }`}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Facilities Filter */}
          <Text className="text-lg font-rubik-bold mt-4 mb-2">Facilities</Text>
          <View className="flex-row flex-wrap gap-2">
            {facilities.map((facility) => (
              <TouchableOpacity
                key={facility.title}
                onPress={() => toggleFacility(facility.title as FacilityType)}
                className={`px-4 py-2 rounded-full flex-row items-center ${
                  filters.facilities?.includes(facility.title as FacilityType)
                    ? 'bg-primary-300'
                    : 'bg-primary-100'
                }`}
              >
                <Image 
                  source={facility.icon} 
                  className="w-4 h-4 mr-2"
                  tintColor={
                    filters.facilities?.includes(facility.title as FacilityType)
                      ? 'white'
                      : '#191D31'
                  }
                />
                <Text className={`text-sm ${
                  filters.facilities?.includes(facility.title as FacilityType)
                    ? 'text-white font-rubik-bold'
                    : 'text-black-300 font-rubik'
                }`}>
                  {facility.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          <View className="flex-row justify-between mt-6">
            <TouchableOpacity
              onPress={resetFilters}
              className="flex-1 py-3 bg-gray-100 rounded-full mr-2"
            >
              <Text className="text-center font-rubik-bold text-black-300">
                Reset
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={applyFilters}
              className="flex-1 py-3 bg-primary-300 rounded-full ml-2"
            >
              <Text className="text-center font-rubik-bold text-white">
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}