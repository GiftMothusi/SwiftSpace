import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Text, ScrollView, TouchableOpacity, View } from "react-native";
import { categories } from "@/constants/data";
import { PropertyStatus } from "@/types/property";

const statusFilters: PropertyStatus[] = ["Available", "Rented", "Sold", "Under Contract"];

const Filters = () => {
  const params = useLocalSearchParams<{ filter?: string }>();
  const [selectedCategory, setSelectedCategory] = useState(params.filter || "All");
  const [selectedStatus, setSelectedStatus] = useState(params.status || "");


  const handleCategoryPress = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory("");
      router.setParams({ filter: "" });
      return;
    }

    setSelectedCategory(category);
    router.setParams({ filter: category });
  };

  const handleStatusPress = (status: PropertyStatus) => {
    if (selectedStatus === status) {
      setSelectedStatus("");
      router.setParams({ status: "" });
      return;
    }

    setSelectedStatus(status);
    router.setParams({ status });
  };

  return (
    <View>
         <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-3 mb-2"
    >
      {categories.map((item, index) => (
        <TouchableOpacity
          onPress={() => handleCategoryPress(item.category)}
          key={index}
          className={`flex flex-col items-start mr-4 px-4 py-2 rounded-full ${
            selectedCategory === item.category
              ? "bg-primary-300"
              : "bg-primary-100 border border-primary-200"
          }`}
        >
          <Text
            className={`text-sm ${
              selectedCategory === item.category
                ? "text-white font-rubik-bold mt-0.5"
                : "text-black-300 font-rubik"
            }`}
          >
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
      <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-2 mb-3"
    >
      {statusFilters.map((status, index) => (
        <TouchableOpacity
          onPress={() => handleStatusPress(status)}
          key={index}
          className={`flex flex-col items-start mr-4 px-4 py-2 rounded-full ${
            selectedStatus === status
              ? "bg-primary-300"
              : "bg-primary-100 border border-primary-200"
          }`}
        >
          <Text
            className={`text-sm ${
              selectedStatus === status
                ? "text-white font-rubik-bold mt-0.5"
                : "text-black-300 font-rubik"
            }`}
          >
            {status}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
    </View>
  );
};

export default Filters;