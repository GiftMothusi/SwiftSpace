import { ImageSourcePropType } from "react-native";

const images = {
  onboarding: require("@/assets/images/onboarding.png") as ImageSourcePropType,
  avatar: require("@/assets/images/avatar.png") as ImageSourcePropType,
  newYork: require("@/assets/images/new-york.png") as ImageSourcePropType,
  japan: require("@/assets/images/japan.png") as ImageSourcePropType,
  cardGradient: require("@/assets/images/card-gradient.png") as ImageSourcePropType,
  barChart: require("@/assets/images/bar-chart.png") as ImageSourcePropType,
  whiteGradient: require("@/assets/images/white-gradient.png") as ImageSourcePropType,
  map: require("@/assets/images/map.png") as ImageSourcePropType,
  noResult: require("@/assets/images/no-result.png") as ImageSourcePropType,
} as const;

export default images;