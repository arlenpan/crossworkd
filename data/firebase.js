import firebase from 'firebase/app';
import 'firebase/database';

// these keys are allowed to be public
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: 'crossworkd.firebaseapp.com',
    databaseURL: 'https://crossworkd.firebaseio.com',
    projectId: 'crossworkd',
    storageBucket: 'crossworkd.appspot.com',
    messagingSenderId: '982812516511',
    appId: '1:982812516511:web:93bfc0960ebe5c0a76c2aa',
    measurementId: 'G-3XHCS4R05W',
};

let fbInstance;

try {
    fbInstance = firebase.initializeApp(firebaseConfig);
} catch (err) {
    if (!/already exists/.test(err.message)) {
        console.error('Firebase initialization error', err.stack);
    }
}

export const fb = fbInstance;
export const fbdb = firebase.database();
