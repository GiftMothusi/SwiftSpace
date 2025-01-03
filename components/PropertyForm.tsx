// components/PropertyForm.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Alert 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Property, PropertyType, PropertyStatus } from '../types/property';

// Define the component props
interface PropertyFormProps {
  initialData?: Property;  // Optional initial data for editing
  onSubmit: (data: Property, images: File[]) => Promise<void>;
  isLoading: boolean;
}

export default function PropertyForm({ 
  initialData, 
  onSubmit, 
  isLoading 
}: PropertyFormProps) {
  // Initialize form state with initial data or default values
  const [formData, setFormData] = useState<Property>(initialData || {
    name: '',
    type: 'House',
    status: 'Available',
    description: '',
    address: '',
    price: 0,
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    facilities: [],
    images: [],
    agent: ''
  });

  // State for managing selected images
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  // Handle image selection
  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const files = result.assets.map(asset => ({
          uri: asset.uri,
          type: 'image/jpeg',
          name: 'property-image.jpg'
        } as unknown as File));
        setSelectedImages(prev => [...prev, ...files]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      await onSubmit(formData, selectedImages);
      Alert.alert('Success', 'Property saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save property');
    }
  };

  return (
    <ScrollView className="p-4">
      <Text className="text-lg font-rubik-bold mb-2">Property Details</Text>
      
      {/* Property Name */}
      <TextInput
        className="border border-primary-200 rounded-lg p-2 mb-4"
        placeholder="Property Name"
        value={formData.name}
        onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
      />

      {/* Property Type Selection */}
      <View className="mb-4">
        <Text className="font-rubik mb-2">Property Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Object.values(PropertyType).map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setFormData(prev => ({ ...prev, type }))}
              className={`mr-2 px-4 py-2 rounded-full ${
                formData.type === type ? 'bg-primary-300' : 'bg-primary-100'
              }`}
            >
              <Text className={`
                font-rubik 
                ${formData.type === type ? 'text-white' : 'text-black-300'}
              `}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Price Input */}
      <TextInput
        className="border border-primary-200 rounded-lg p-2 mb-4"
        placeholder="Price"
        keyboardType="numeric"
        value={formData.price.toString()}
        onChangeText={(text) => 
          setFormData(prev => ({ ...prev, price: parseFloat(text) || 0 }))
        }
      />

      {/* Description Input */}
      <TextInput
        className="border border-primary-200 rounded-lg p-2 mb-4"
        placeholder="Description"
        multiline
        numberOfLines={4}
        value={formData.description}
        onChangeText={(text) => 
          setFormData(prev => ({ ...prev, description: text }))
        }
      />

      {/* Image Picker */}
      <TouchableOpacity
        onPress={handleImagePick}
        className="bg-primary-100 p-4 rounded-lg mb-4"
      >
        <Text className="text-center font-rubik">Add Images</Text>
      </TouchableOpacity>

      {/* Selected Images Preview */}
      {selectedImages.length > 0 && (
        <ScrollView horizontal className="mb-4">
          {selectedImages.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image.uri }}
              className="w-20 h-20 rounded-lg mr-2"
            />
          ))}
        </ScrollView>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isLoading}
        className={`bg-primary-300 p-4 rounded-lg ${isLoading ? 'opacity-50' : ''}`}
      >
        <Text className="text-white text-center font-rubik-bold">
          {isLoading ? 'Saving...' : 'Save Property'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}