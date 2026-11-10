import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';

const app=initializeApp({
  apiKey:'AIzaSyBingUImUleLKTVg1Ci6_doIJeXC0C-Z7I',
  authDomain:'cvmatch-ai-14736.firebaseapp.com',
  projectId:'cvmatch-ai-14736',
  storageBucket:'cvmatch-ai-14736.firebasestorage.app',
  messagingSenderId:'807800079680',
  appId:'1:807800079680:web:64ac1aef3e2a90cbc1a6a5'
});

export const auth=getAuth(app);
export const db=getFirestore(app);
