import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ReceiptData } from '@/src/types/items';

export default function ReceiptSummary({Store, Total, Items}:ReceiptData) {
    return (
        <Pressable>
            <Text>
                {Store}
            </Text>
            <Text>
                ${Total}
            </Text>
        </Pressable>
    )
}