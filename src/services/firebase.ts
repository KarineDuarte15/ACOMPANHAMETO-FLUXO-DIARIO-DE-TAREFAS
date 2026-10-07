// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "rotina-inteligente-508715",
  appId: "1:945309987493:web:1c68e074d45eccc05ad34c",
  apiKey: "AIzaSyAnvLIfAkHARaEo6ZRm4eY8jE18E-7BpOA",
  authDomain: "rotina-inteligente-508715.firebaseapp.com",
  storageBucket: "rotina-inteligente-508715.firebasestorage.app",
  messagingSenderId: "945309987493"
};

// Inicializamos a aplicação Firebase com as credenciais reais do applet
const app = initializeApp(firebaseConfig);

// Exportamos o 'db' (Firestore) e o 'auth' (Firebase Auth)
export const db = getFirestore(app);
export const auth = getAuth(app);