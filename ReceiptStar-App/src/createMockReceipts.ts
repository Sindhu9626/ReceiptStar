import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { mockReceipts } from "./mock/mockData";

export async function insertMockReceipts(userId: string) {
  try {
    //marker document to prevent duplicates
    const markerRef = doc(db, "Users", userId, "Meta", "__mockDataInserted");
    const markerSnap = await getDoc(markerRef);

    if (markerSnap.exists()) {
      console.log("Mock receipts already inserted for this user.");
      return; 
    }

    const receiptsRef = collection(db, "Users", userId, "Receipts");

    //inserts mock receipts exactly once...
    for (const r of mockReceipts) {
      await setDoc(doc(receiptsRef), {
        Store: r.Store,
        Category: r.Category,
        Total: r.Total,
        Items: r.Items,
        Date: r.Date,
      });
    }

    //...then sets marker so we never insert again
    await setDoc(markerRef, { inserted: true });

    console.log("Mock receipts successfully added.");
  } catch (error) {
    console.error("Error inserting mock receipts:", error);
  }
}
