import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {initializeAppCheck,ReCaptchaEnterpriseProvider} from 'firebase/app-check';

export const app=initializeApp({
  apiKey:'AIzaSyBingUImUleLKTVg1Ci6_doIJeXC0C-Z7I',
  authDomain:'cvmatch-ai-14736.firebaseapp.com',
  projectId:'cvmatch-ai-14736',
  storageBucket:'cvmatch-ai-14736.firebasestorage.app',
  messagingSenderId:'807800079680',
  appId:'1:807800079680:web:64ac1aef3e2a90cbc1a6a5'
});

// GitHub Pages uses the public reCAPTCHA site key; no secret key is bundled.
if(typeof window!=='undefined'&&!['localhost','127.0.0.1'].includes(window.location.hostname)){
  initializeAppCheck(app,{
    provider:new ReCaptchaEnterpriseProvider('6LcOrxkuAAAAAHC0k-ESM1_Rf3Q_Oq38Ff7Ir_Yl'),
    isTokenAutoRefreshEnabled:true
  });
}

export const auth=getAuth(app);
export const db=getFirestore(app);
