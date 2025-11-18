import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Receipt } from "../types/receipt";

export async function fetchAllReceipts(user: { uid: string }): Promise<Receipt[]> {
  const userDoc = collection(db, "Users", user.uid, "Receipts");

  const snap = await getDocs(userDoc);

  const receipts: Receipt[] = snap.docs.map(docSnap => {
    const data = docSnap.data();

    return {
      id: docSnap.id,
      Store: data.Store,
      Category: data.Category,
      Total: data.Total,
      Items: data.Items || [],
      Date: data.Date,
    };
  });

  return receipts;
}
