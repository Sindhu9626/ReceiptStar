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