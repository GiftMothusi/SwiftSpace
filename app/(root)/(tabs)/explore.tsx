import {
    ActivityIndicator,
    FlatList,
    Image,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
  } from "react-native";
  import { useEffect } from "react";
  import { router, useLocalSearchParams } from "expo-router";
  
  import icons from "@/constants/icon";
  import EnhancedSearch from "@/components/Search/EnhancedSearch";
  import { Card } from "@/components/Cards";
  import Filters from "@/components/Filters";
  import NoResults from "@/components/NoResults";
  
  import { getProperties, GetPropertiesParams } from "@/lib/appwrite";
  import { useAppwrite } from "@/lib/useAppwrite";
  import { PropertySearchFilters } from "@/types/property";
  import { PROPERTY_TYPES } from "@/constants/propertyContants";
  
  const Explore = () => {
    const params = useLocalSearchParams<{ query?: string; filter?: string }>();
  
    // Create initial params with proper typing
    const initialParams: GetPropertiesParams = {
      filter: params.filter || undefined,
      query: params.query || undefined,
      searchFilters: undefined,
    };
  
    const {
      data: properties,
      refetch,
      loading,
    } = useAppwrite<any, GetPropertiesParams>({
      fn: getProperties,
      params: initialParams,
      skip: true,
    });
  
    useEffect(() => {
      // Create effect params with proper typing
      const effectParams: GetPropertiesParams = {
        filter: params.filter || undefined,
        query: params.query || undefined,
      };
      refetch(effectParams);
    }, [params.filter, params.query]);
  
    const handleSearch = async (filters: PropertySearchFilters) => {
      // Create search params with proper typing
      const searchParams: GetPropertiesParams = {
        filter: params.filter || undefined,
        query: params.query || undefined,
        searchFilters: filters,
      };
      refetch(searchParams);
    };
  
    const handleCardPress = (id: string) => router.push(`/properties/${id}`);
  
    return (
      <SafeAreaView className="h-full bg-white">
        <FlatList
          data={properties}
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
          ListHeaderComponent={() => (
            <View className="px-5">
              <View className="flex flex-row items-center justify-between mt-5">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
                >
                  <Image source={icons.backArrow} className="size-5" />
                </TouchableOpacity>
  
                <Text className="text-base mr-2 text-center font-rubik-medium text-black-300">
                  Search for Your Ideal Home
                </Text>
                <Image source={icons.bell} className="w-6 h-6" />
              </View>
  
              <EnhancedSearch onSearch={handleSearch} />
  
              <View className="mt-5">
                <Filters />
  
                <Text className="text-xl font-rubik-bold text-black-300 mt-5">
                  Found {properties?.length} Properties
                </Text>
              </View>
            </View>
          )}
        />
      </SafeAreaView>
    );
  };
  
  export default Explore;