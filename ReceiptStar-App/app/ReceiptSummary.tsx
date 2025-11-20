import { ReceiptData } from '@/src/types/items';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ReceiptSummary({receipt}: {receipt: ReceiptData}) {
    const onPress = () => {
        router.push({
        pathname: "/receipt",
        params: { receiptData: JSON.stringify(receipt) },
        });
    }

    const unformattedDate = receipt.Date;
    const date = new Date(unformattedDate.seconds * 1000 + unformattedDate.nanoseconds / 1e6);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit'
    });

    return (
        <Pressable onPress={onPress} style={styles.container}>
            <View style={styles.viewContainer}>
                <Text style={styles.storeName}>
                    {receipt.Store}
                </Text>
                <Text style ={styles.total}>
                    ${receipt.Total.toFixed(2)}
                </Text>
            </View>
            <Text>
                {formattedDate}
            </Text>
        </Pressable>
    )
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 1,
    },

    viewContainer: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        marginBottom: 2 
    }, 

    storeName: {
        fontWeight: "700", fontSize: 16
    },

    total: {
        fontWeight: "600"
    },

});