import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// PASSO OBRIGATÓRIO:
// Substitua o objeto abaixo pelas credenciais que você copiou do 
// Console do Firebase (Passo 2 do guia).
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyCz53LqDjv8Ivys0tEH6BBqyIgt4KCw4Sw",
  authDomain: "euvou-df348.firebaseapp.com",
  projectId: "euvou-df348",
  storageBucket: "euvou-df348.firebasestorage.app",
  messagingSenderId: "328862272093",
  appId: "1:328862272093:web:a7c5314f59f64c3abb1bb4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);