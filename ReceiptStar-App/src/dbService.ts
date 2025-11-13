import { doc, setDoc } from "firebase/firestore";
import { db } from './firebaseConfig';

// user doc used to store profile info and link receipts collection to
export async function createUserDoc(newUserID:string, newUserEmail:string) {
    const newUserDoc = doc(db, "users", newUserID);

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