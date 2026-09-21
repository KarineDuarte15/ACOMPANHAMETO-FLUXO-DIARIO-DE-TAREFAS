// src/services/firebase.ts

// 1. Importamos as ferramentas fundamentais do Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "878269830878",
  authDomain: "rotinainteligentehap.firebaseapp.com", // Geralmente segue este padrão
  projectId: "rotinainteligentehap",
  storageBucket: "rotinainteligentehap.appspot.com", // Geralmente segue este padrão
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

// 3. Inicializamos a aplicação Firebase com as tuas credenciais
const app = initializeApp(firebaseConfig);

// 4. Exportamos o 'db' (banco de dados Firestore) para podermos gravar e ler dados nos outros ficheiros
export const db = getFirestore(app);