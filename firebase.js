// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC5BQwTDhZRFiYPB6dVJq7WpoOqr8UfU6k",
  authDomain: "pantry-tracker-7e421.firebaseapp.com",
  projectId: "pantry-tracker-7e421",
  storageBucket: "pantry-tracker-7e421.appspot.com",
  messagingSenderId: "28409630687",
  appId: "1:28409630687:web:9e6df70ab40a43bcf8fe6a",
  measurementId: "G-QZVXCHJ1MS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const firestore= getFirestore(app);

export {firestore}