import { useState, useEffect } from 'react';
import { useGlobalContext } from '@/lib/global-provider';
import { 
  addToFavorites, 
  removeFromFavorites,
  checkIsFavorite 
} from '@/lib/appwrite';
import { Models } from 'react-native-appwrite';

export const useFavorites = (propertyId?: string) => {
  const { user } = useGlobalContext();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && propertyId) {
      checkFavoriteStatus();
    }
  }, [user, propertyId]);

  const checkFavoriteStatus = async () => {
    if (!user || !propertyId) return;
    
    const favorite = await checkIsFavorite(propertyId, user.$id);
    setIsFavorite(!!favorite);
    setFavoriteId(favorite?.$id || null);
  };

  const toggleFavorite = async () => {
    if (!user || !propertyId) return;
    
    setLoading(true);
    try {
      if (isFavorite && favoriteId) {
        await removeFromFavorites(favoriteId);
        setIsFavorite(false);
        setFavoriteId(null);
      } else {
        const result = await addToFavorites(propertyId, user.$id);
        if (result) {
          setIsFavorite(true);
          setFavoriteId(result.$id);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    isFavorite,
    toggleFavorite,
    loading
  };
};