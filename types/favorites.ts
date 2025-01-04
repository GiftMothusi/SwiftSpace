import { Models } from "react-native-appwrite";

export interface Favorite extends Models.Document {
  user_id: string;
  property_id: string;
  created_at: string;
}