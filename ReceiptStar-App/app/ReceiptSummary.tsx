import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ReceiptData } from '@/src/types/items';

export default function ReceiptSummary({store, total, items}:ReceiptData) {
    return (
        <Pressable>
            <Text>
                {store}
            </Text>
            <Text>
                ${total}
            </Text>
        </Pressable>
    )
}