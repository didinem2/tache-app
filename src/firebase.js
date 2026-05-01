import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBc_Ktt9kk5iaRymU5mF0C9lJGy8WoWQlU",
  authDomain: "suivi-taches-44fc1.firebaseapp.com",
  projectId: "suivi-taches-44fc1",
  storageBucket: "suivi-taches-44fc1.firebasestorage.app",
  messagingSenderId: "26177405609",
  appId: "1:26177405609:web:f5cb3b3748599f5c925fb8",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
