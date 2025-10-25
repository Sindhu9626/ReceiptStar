import { Link } from 'expo-router';
import { View, Text, StyleSheet, Dimensions, Image, Animated} from "react-native";

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMemo, useEffect } from 'react';

const { width, height} = Dimensions.get("window");

const PURPLE = "#A78BFA"
const STAR_SIZE = 28;

const STAR_POS = [
  { x: 0.12, y: 0.18 }, { x: 0.25, y: 0.30 }, { x: 0.38, y: 0.16 },
  { x: 0.52, y: 0.24 }, { x: 0.68, y: 0.18 }, { x: 0.82, y: 0.30 },
  { x: 0.15, y: 0.52 }, { x: 0.30, y: 0.44 }, { x: 0.45, y: 0.50 },
  { x: 0.60, y: 0.42 }, { x: 0.75, y: 0.52 }, { x: 0.88, y: 0.46 },
  { x: 0.20, y: 0.70 }, { x: 0.34, y: 0.78 }, { x: 0.50, y: 0.72 },
  { x: 0.66, y: 0.78 }, { x: 0.78, y: 0.68 }, { x: 0.90, y: 0.74 },
];

export default function LoadingWelcomeScreen() {
  return (
    <View style ={styles.container}>
      {STAR_POS.map(({ x, y }, i) => (
        <Image
          key={i}
          source={require("../assets/appImages/starIMG.png")}
          style={[
            styles.star,
            {
              // place by percentage of screen
              left: x * width - STAR_SIZE / 2,
              top: y * height - STAR_SIZE / 2,
              width: STAR_SIZE,
              height: STAR_SIZE,
            },
          ]}
          resizeMode="contain"
        />
      ))}
    </View>
      
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PURPLE,
  },
  star: {
    position: "absolute",
  },
  
});

