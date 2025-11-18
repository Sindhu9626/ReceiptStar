import { getAuth } from 'firebase/auth';
import app from './firebaseConfig';
//import { useRouter } from 'expo-router';

const auth = getAuth(app);
//const router = useRouter();

export async function checkCurrentUser() {
    // Ensure that authState object is ready before checking it
    await auth.authStateReady();
    const user = auth.currentUser;
    if(user != null) {
        console.log(user.uid);
        return true;
    }
    else {
        return false;
    }
}

// returns current user ID or throws an error if no user logged in
export async function getCurrentUserID() {
    await auth.authStateReady();
    const user = auth.currentUser;
    if (user !== null) {    
        const uid = user.uid;
        return uid;
    }
    else {
        throw new Error("No user signed in");
    }
}