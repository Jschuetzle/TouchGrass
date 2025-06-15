// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAoM4xFCuy4SYgeuDDD9HVKu6F-793icn4",
  authDomain: "touch-f2af2.firebaseapp.com",
  projectId: "touch-f2af2",
  storageBucket: "touch-f2af2.firebasestorage.app",
  messagingSenderId: "166953590796",
  appId: "1:166953590796:web:8de8aca39f7821c7030e29",
  measurementId: "G-VCGTNYR37W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };