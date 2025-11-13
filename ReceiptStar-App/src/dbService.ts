import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { db } from './firebaseConfig';
import { LineItem } from "./types/items";

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