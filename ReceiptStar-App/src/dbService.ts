import { doc, setDoc } from "firebase/firestore";
import { db } from './firebaseConfig';

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