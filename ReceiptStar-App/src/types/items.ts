export interface LineItem {
    item: string;
    itemCost: number;
}

export interface ReceiptData {
    total: string;
    items: LineItem[];
    store: string;
}