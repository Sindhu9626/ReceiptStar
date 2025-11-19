import { addDoc, collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { getCurrentUserID } from "./checkLogin";
import { db } from './firebaseConfig';
import { LineItem, ReceiptData } from "./types/items";

// user doc used to store profile info and link receipts collection to
export async function createUserDoc(newUserID:string, newUserEmail:string) {
    const newUserDoc = doc(db, "Users", newUserID);

    const userData = {
        email: newUserEmail
    };

    try {
        await setDoc(newUserDoc, userData);
    }
    catch (e) {
        console.error("Error setting document: ", e);
    }
}

// stores information parsed from receipt into db
export async function createReceipt(storeName:String, category:String, total:number, items:LineItem[], userID:string) {
    const userDoc = doc(db, "Users", userID);
    const receiptCollection = collection(userDoc, "Receipts");

    const receipt = {
        Store: storeName,
        Category: category,
        Total: total,
        Items: items,
        Date: new Date()
    }

    try {
        const receiptDoc = await addDoc(receiptCollection, receipt);
        console.log("Receipt added to Receipts collection with ID: " + receiptDoc.id);
    }
    catch (e) {
        console.error("Error adding receipt: ", e);
    }
}

export async function getReceiptsByCategory(category:string) {
    const userID: string = await getCurrentUserID();
    const userDoc = doc(db, "Users", userID);
    const receiptCollection = collection(userDoc, "Receipts");
    const catQuery = query(receiptCollection, where ("Category", "==", category));
    const catSnapshot = await getDocs(catQuery);
    const receipts: ReceiptData[] = [];
    catSnapshot.forEach(receipt => {
        receipts.push(receipt.data() as ReceiptData);
    });

    return receipts;
}