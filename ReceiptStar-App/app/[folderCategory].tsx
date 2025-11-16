import { useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
export default function ReceiptFolderScreen() {
    const {folderCategory} = useLocalSearchParams();
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Receipts</Text>
                <Text style={styles.subtitle}>{folderCategory} folder</Text>
            </View>
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
});