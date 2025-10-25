import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Image, StyleSheet, View } from "react-native";


const { width, height} = Dimensions.get("window");

const PURPLE = "#A78BFA"
const STAR_SIZE = 34;

const STAR_POS = [
  { x: 0.12, y: 0.18 }, { x: 0.25, y: 0.30 }, { x: 0.38, y: 0.16 },
  { x: 0.52, y: 0.24 }, { x: 0.68, y: 0.18 }, { x: 0.82, y: 0.30 },
  { x: 0.15, y: 0.52 }, { x: 0.30, y: 0.44 }, { x: 0.45, y: 0.50 },
  { x: 0.60, y: 0.42 }, { x: 0.75, y: 0.52 }, { x: 0.88, y: 0.46 },
  { x: 0.20, y: 0.70 }, { x: 0.34, y: 0.78 }, { x: 0.50, y: 0.72 },
  { x: 0.66, y: 0.78 }, { x: 0.78, y: 0.68 }, { x: 0.90, y: 0.74 },
  { x: 0.34, y: 0.63 }, { x: 0.42, y: 0.31 }, 
];

export default function LoadingWelcomeScreen() {
  const rocketX = useRef(new Animated.ValueXY({x:0, y: height - 100})).current; // start off-screen left

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rocketX, {
          toValue: {x: width - 100, y: 0}, // move right across screen
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(rocketX, {
          toValue: {x:0, y: height - 100}, // reset back left
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [rocketX]);

  return (
     <View style={styles.container}>
      <Animated.Image
        source={require("../../assets/appImages/rocketIMG.png")}
        style={[styles.rocket, { transform: [{ translateX: rocketX }] }]}
      />
    
      {STAR_POS.map(({ x, y }, i) => (
        <Image
          key={i}
          source={require("../../assets/appImages/star_nbg_IMG.png")}
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
  rocket: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    position: "absolute",
    top: 100,
  },
  
});

