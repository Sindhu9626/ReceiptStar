export interface LineItem {
    item: string;
    itemCost: number;
}

export interface ReceiptData {
    Total: number;
    Items: LineItem[];
    Store: string;
}