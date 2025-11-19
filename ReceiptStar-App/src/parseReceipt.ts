import { LineItem } from './types/items'
import { createReceipt } from './dbService';
import fs from "fs"

export type ParsedForDb = {
    storeName: string;
    total: number;
    items: LineItem[];
}

export async function parseReceipt(rawReceipt: any, userID: string, category: string = "Uncategorized"): Promise<ParsedForDb> {
    

    try {
       // const filePath = '../receipt_data.json';
        //const jsonReceipt = fs.readFileSync(filePath, 'utf8');
        const receiptData = rawReceipt || {}; //JSON.parse(jsonReceipt);

        let store: string;
        if(typeof receiptData.merchant === "string") {
            store = receiptData.merchant;
        }
        else {
            store = "Unknown Merchant";
        }

        let total: number;
        if(typeof receiptData.total === "number") {
            total = receiptData.total;
        }
        else {
            total = 0;
        }

        const uncheckedItems = Array.isArray(receiptData.items)?receiptData.items:[];

        const checkedItems: LineItem[] = uncheckedItems.map
            ((currentItem: any) => ({
                item: typeof currentItem?.name === "string"
                ? currentItem.name 
                : "Unknown Item",

                itemCost: typeof currentItem?.lineTotal === "number" 
                ? currentItem.lineTotal 
                : 0
            })
        );

        console.log(store);
        console.log(total);
        console.log(checkedItems);

        await createReceipt(store, category, total, checkedItems, userID);

        return{store, total, items: checkedItems};

        } catch (error) {
        console.error('Error reading file:', error);
    }
    


}
