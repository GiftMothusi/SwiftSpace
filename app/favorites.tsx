import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';

import { Card } from '@/components/Cards';
import NoResults from '@/components/NoResults';
import { getFavorites, getPropertyById } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { Models } from 'react-native-appwrite';
import icons from '@/constants/icon';

export default function FavoritesScreen() {
  const { user } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Models.Document[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userFavorites = await getFavorites(user.$id);
      const properties = await Promise.all(
        userFavorites.map(favorite => 
          getPropertyById({ id: favorite.property_id })
        )
      );
      setFavorites(properties.filter(Boolean) as Models.Document[]);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardPress = (id: string) => router.push(`/properties/${id}`);

  return (
    <SafeAreaView className="h-full bg-white">
      <View className="flex flex-row items-center justify-between px-5 py-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
        >
          <Image source={icons.backArrow} className="size-5" />
        </TouchableOpacity>

        <Text className="text-xl font-rubik-bold text-black-300 flex-1 text-center">
          Your Favorites
        </Text>

        <View className="size-11" />
      </View>

      <FlatList
        data={favorites}
        numColumns={2}
        renderItem={({ item }) => (
          <Card item={item} onPress={() => handleCardPress(item.$id)} />
        )}
        keyExtractor={(item) => item.$id}
        contentContainerClassName="pb-32"
        columnWrapperClassName="flex gap-5 px-5"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" className="text-primary-300 mt-5" />
          ) : (
            <NoResults />
          )
        }
        onRefresh={loadFavorites}
        refreshing={loading}
      />
    </SafeAreaView>
  );
}