import { LineItem } from "@/src/types/items";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Receipt() {
    const {receiptData} = useLocalSearchParams<{receiptData: string}>();
    const receipt = JSON.parse(receiptData);
    const router = useRouter();

    const unformattedDate = receipt.Date;
    const date = new Date(unformattedDate.seconds * 1000 + unformattedDate.nanoseconds / 1e6);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit'
    });

    return (
        <ScrollView style={styles.container}>
            <View>
                <Pressable onPress={() => router.back()}>
                    <Image style = {styles.backButton} source={require('../assets/appImages/backButtonBlack.png')}/>
                </Pressable>
                <Text style={styles.storeName}>
                    {receipt.Store}
                </Text>
            </View>
            <View style={styles.itemsContainer}>
                {
                   receipt.Items.map((itemLine:LineItem, index:number) => (
                        <View style={styles.itemLine} key={(index+1)*2}>
                            <Text style={styles.item} key={index}>{itemLine.item}</Text>
                            <Text style={styles.item} key={(index+1)*3}>${itemLine.itemCost.toFixed(2)}</Text>
                        </View>
                   ))
                }
            </View>
            <View style={styles.totalLine}>
                <Text style={styles.total}>Total</Text>
                <Text style={styles.total}>${receipt.Total.toFixed(2)}</Text>
            </View>
            <View>
                
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({ 
    container: {
        flex:1,
        marginTop: 80,
    },

    storeName: {
        fontWeight: 700,
        fontSize: 40,
        textAlign: "center",
        marginBottom: 25,
    },

    itemsContainer: {
        justifyContent: "flex-start",
        alignItems: "center",
        marginBottom: 10,
    },

    itemLine: {
        justifyContent: "space-between",
        flexDirection: "row",
        width: '100%',
        paddingHorizontal: 50,
        marginBottom: 5,
    },


    totalLine: {
        justifyContent: "space-between",
        flexDirection: "row",
        width: '100%',
        paddingHorizontal: 50,
    },

    total: {
        fontWeight: 600,
        fontSize: 18
    },
    
    item: {
        fontSize: 16,
    }, 
    
    backButton: {
        justifyContent: "flex-start",
        alignItems: "flex-start",
        marginLeft: 20,
        height: 30,
        width: 30,
    },

})