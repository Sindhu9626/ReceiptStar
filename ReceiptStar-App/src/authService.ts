import { auth } from "./firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential
} from "firebase/auth";

// Sign up new users
export async function signUp(email: string, password: string): Promise<UserCredential> {
  return await createUserWithEmailAndPassword(auth, email, password);
}

// Log in existing users
export async function logIn(email: string, password: string): Promise<UserCredential> {
  return await signInWithEmailAndPassword(auth, email, password);
}

// Log out
export async function logOut(): Promise<void> {
  return await signOut(auth);
}
