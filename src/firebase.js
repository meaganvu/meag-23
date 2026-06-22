// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDKiC3dAU5hS6StFI0jhmqWBap-LbkfW_o",
  authDomain: "meag-23.firebaseapp.com",
  projectId: "meag-23",
  storageBucket: "meag-23.firebasestorage.app",
  messagingSenderId: "134523630391",
  appId: "1:134523630391:web:66b98dc8df33bc109c20b2",
  measurementId: "G-V86Z786H4R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };