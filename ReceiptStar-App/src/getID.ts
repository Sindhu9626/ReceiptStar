
import { getAuth } from "firebase/auth";
import app from "./firebaseConfig";

const auth = getAuth(app);


export async function getCurrentUserId(): Promise<string | null> {
  await auth.authStateReady();          // make sure auth state is loaded
  const user = auth.currentUser;
  return user ? user.uid : null;
}
