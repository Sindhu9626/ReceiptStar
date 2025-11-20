import {router} from "expo-router";
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { TouchableOpacity } from "react-native";

const { width, height } = Dimensions.get("window");

const scanComplete = () => {
    const analyticsButton = () =>{
        router.push("/(tabs)/data");
        console.log('Analytics');
    }

    const dashboardButton = () =>{
        router.push("/(tabs)");
        console.log('Dashboard');
    }

    return (
    <View style={styles.container}>
      <Text style={styles.scanCompleteText}>Scan Complete</Text>
      
      <TouchableOpacity style = {styles.button} onPress={analyticsButton}>
        <Text style = {styles.text}>Analysis</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style = {styles.button} onPress={dashboardButton}>
        <Text style = {styles.text}>Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};
//<Button title="Analysis" onPress={analyticsButton} />
//<Button title="Dashboard" onPress={dashboardButton} />
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',    
    backgroundColor: '#fff', 
  },
  scanCompleteText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30, 
  },
  button:{
    backgroundColor: "#A78BFA",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems:'center',
    justifyContent:'center',
    marginVertical: 10,


  },
  text:{
    color: "#ffffffff", 
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default scanComplete;
