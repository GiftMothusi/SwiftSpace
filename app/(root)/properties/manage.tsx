// app/properties/manage.tsx
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppwrite } from '@/lib/useAppwrite';
import { createProperty } from '@/lib/appwrite';
import PropertyForm from '@/components/PropertyForm';
import { Property } from '@/types/property';
import { useGlobalContext } from '@/lib/global-provider';

export default function ManageProperty() {
  // Get the current user from global context
  const { user } = useGlobalContext();
  
  // Setup Appwrite hooks for property creation
  const { loading, error, refetch } = useAppwrite({
    fn: createProperty,
    skip: true,  // Don't execute on component mount
  });

  // Handle form submission
  const handleSubmit = async (data: Property, images: File[]) => {
    // Set the agent ID from the logged-in user
    const propertyData = {
      ...data,
      agent: user?.$id,
    };

    await createProperty(propertyData, images);
    // Refresh the properties list after creation
    refetch();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <PropertyForm
        onSubmit={handleSubmit}
        isLoading={loading}
      />
    </SafeAreaView>
  );
}