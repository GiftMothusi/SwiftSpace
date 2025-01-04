import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { useFavorites } from '@/hooks/useFavorites';
import icons from '@/constants/icon';
import * as Haptics from 'expo-haptics';

interface Props {
  propertyId: string;
  size?: number;
  style?: string;
}

const FavoriteButton = ({ propertyId, size = 20, style = '' }: Props) => {
  const { isFavorite, toggleFavorite, loading } = useFavorites(propertyId);

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={loading}
      className={`${style}`}
    >
      <Image
        source={icons.heart}
        className={`w-${size} h-${size}`}
        tintColor={isFavorite ? '#F75555' : '#666876'}
      />
    </TouchableOpacity>
  );
};

export default FavoriteButton;