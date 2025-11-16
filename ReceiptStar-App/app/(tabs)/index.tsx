import { useRouter } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import "../../src/firebaseConfig";


export default function HomeScreen() {
  const router = useRouter();
  const onPress = () => {
    router.push("../groceries");
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back!</Text>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Receipts</Text>
        <View style={styles.receiptFolders}>
          <TouchableOpacity style={styles.folderContainer}  onPress={() => router.push("../groceries")}>
            <Image style={styles.folder} source={require('../../assets/appImages/violet_folder.png')}/>
            <Text style={styles.folderTitle}>Groceries</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("../gas")} style={styles.folderContainer}>
            <Image style={styles.folder} source={require('../../assets/appImages/violet_folder.png')}/>
            <Text style={styles.folderTitle}>Gas</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("../entertainment")} style={styles.folderContainer}>
            <Image style={styles.folder} source={require('../../assets/appImages/violet_folder.png')}/>
            <Text style={styles.folderTitle}>Entertainment</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("../miscellaneous")} style={styles.folderContainer}>
            <Image style={styles.folder} source={require('../../assets/appImages/violet_folder.png')}/>
            <Text style={styles.folderTitle}>Miscellaneous</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },

  header: { 
    backgroundColor: "#A78BFA", 
    paddingTop: 70, 
    paddingBottom: 30, 
    alignItems: "center" 
  },

  subtitle: {
    color: "#F5F3FF",
    fontSize: 16,
    marginTop: 6,
    opacity: 0.9,
  },

  title: { 
    color: "#fff", 
    fontSize: 34, 
    fontWeight: "bold" 
  },

  contentContainer: { 
    padding: 20 
  },
  
  sectionTitle: { 
    fontSize: 24, 
    fontWeight: "600", 
    color: "#333", 
    marginBottom: 10 
  },

  folder: {
    height: 70,
    width: 70,
    
  },

  folderContainer: {
    justifyContent: 'center',
    alignItems:'center',
    height: 100,
    width: 107,
    paddingHorizontal: 5,
    paddingVertical: 10,
    backgroundColor:"#EDE9FE",
    borderRadius: 10,
  },

  receiptFolders: {
    flexDirection: 'row',
    maxWidth: '100%',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 15,
  }, 

  folderTitle: {
    fontWeight: "600", 
    color: "#65636B",
  }
 
});

