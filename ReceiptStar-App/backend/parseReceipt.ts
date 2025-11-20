import { LineItem } from '../src/types/items'
import fs from "fs"

export function parseReceipt() {

    try {
        const filePath = '../receipt_data.json';
        const jsonReceipt = fs.readFileSync(filePath, 'utf8');
        const receiptData = JSON.parse(jsonReceipt);

        if(typeof receiptData.merchant === "string") {
            var store:string = receiptData.merchant;
        }
        else {
            var store:string = "Unknown Merchant";
        }

         if(typeof receiptData.total === "number") {
            var total:number = receiptData.total;
        }
        else {
            var total:number = 0;
        }
        const uncheckedItems = receiptData.items;
        var checkedItems: LineItem[] = uncheckedItems.map((currentItem: any) => ({
        item: typeof currentItem.name === "string" ? currentItem.name : "Unknown Item",
        itemCost: typeof currentItem.lineTotal === "number" ? currentItem.lineTotal : 0
        }));
        console.log(store);
        console.log(total);
        console.log(checkedItems);
        } catch (error) {
        console.error('Error reading file:', error);
    }
    


}