import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Image, StyleSheet, View } from "react-native";
import { checkCurrentUser } from '../src/checkLogin';



const { width, height} = Dimensions.get("window");

const PURPLE = "#A78BFA"
const STAR_SIZE = 36;

const STAR_POS = [
  { x: 0.12, y: 0.18 }, { x: 0.25, y: 0.30 }, { x: 0.38, y: 0.16 },
  { x: 0.52, y: 0.24 }, { x: 0.68, y: 0.18 }, { x: 0.82, y: 0.30 },
  { x: 0.15, y: 0.52 }, { x: 0.30, y: 0.44 }, { x: 0.45, y: 0.50 },
  { x: 0.60, y: 0.42 }, { x: 0.75, y: 0.52 }, { x: 0.88, y: 0.46 },
  { x: 0.20, y: 0.70 }, { x: 0.34, y: 0.78 }, { x: 0.50, y: 0.72 },
  { x: 0.66, y: 0.78 }, { x: 0.78, y: 0.68 }, { x: 0.90, y: 0.74 },
  { x: 0.34, y: 0.63 }, { x: 0.42, y: 0.31 }, { x: 0.15, y: 0.88 },
  { x: 0.45, y: 0.92 }, { x: 0.75, y: 0.85 }, { x: 0.90, y: 0.95 },
];

export default function LoadingWelcomeScreen() {
  const router = useRouter();
  const rocketXY = useRef(new Animated.ValueXY({x:0, y: Dimensions.get('window').height})).current; 

 
  

  useEffect(() => {
        Animated.timing(rocketXY, {
            toValue: { x: Dimensions.get('window').width, y: 0 }, // Top-right corner
            duration: 3000, // Animation duration in milliseconds
            useNativeDriver: false, // Set to true if animating non-layout properties
        }).start(async ()=>{
          const userStatus = await checkCurrentUser();
           // decide where to go based on if user is logged in
           // route to either login or tabs after load screen
          if(userStatus == true) {
            router.replace("/(tabs)/camera");
            }
            else {
            router.replace("/loginScreen");
            }
          

        });
    }, [rocketXY]);

  return (
     <View style={styles.container}>
      <Animated.Image
        source={require("../assets/appImages/rocketIMG_rbg.png")} 
        style={[
          styles.rocket, 
          { 
            transform: [
              { translateX: rocketXY.x},
              { translateY: rocketXY.y },
            ],
           },
        ]}
     resizeMode = "contain"
      />
      
    
      {STAR_POS.map(({ x, y }, i) => (
        <Image
          key={i}
          source={require("../assets/appImages/star_nbg_IMG.png")}
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
    width: 100,
    height: 100,
    position: "absolute",
  },
  
});

