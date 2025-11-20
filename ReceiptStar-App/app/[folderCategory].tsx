import { getReceiptsByCategory } from '@/src/dbService';
import { ReceiptData } from '@/src/types/items';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import ReceiptSummary from './ReceiptSummary';

export default function ReceiptFolderScreen() {
    const {folderCategory} = useLocalSearchParams();
    const router = useRouter();
    const initialReceiptData: ReceiptData[] = [];
    const [receipts, setReceipts] = useState(initialReceiptData);
    const fetchReceipts = async () => {
      if (typeof folderCategory == "string") {
        const receiptData = await getReceiptsByCategory(folderCategory);
        setReceipts(receiptData);
      }
      else {
        const receiptData = await getReceiptsByCategory(folderCategory[0]);
        setReceipts(receiptData);
      }
    }
    fetchReceipts();
    return (
        <View style={styles.container}>
            <View style={styles.header}>
              <Pressable onPress={() => router.back()}>
                <Image style = {styles.backButton} source={require('../assets/appImages/backButton.png')}/>
              </Pressable>
              <View style={styles.headerText}>
                <Text style={styles.title}>Receipts</Text>
                <Text style={styles.subtitle}>{folderCategory} folder</Text>
              </View>
            </View>
            <View>
              {
                receipts.map((receipt, index) => (
                    <ReceiptSummary key={index} receipt={receipt}/>
                ))
              }
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
  },

  headerText: {
    alignItems: "center",
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
    fontWeight: "bold" ,
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

  backButton: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginLeft: 20,
    height: 30,
    width: 30
  },
});