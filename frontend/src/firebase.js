import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAap1KhJxHC7gPkeuofMZ8u7S5rYv16Giw",
  authDomain: "ai-interior-designer-b4c9d.firebaseapp.com",
  projectId: "ai-interior-designer-b4c9d",
  storageBucket: "ai-interior-designer-b4c9d.firebasestorage.app",
  messagingSenderId: "878741315473",
  appId: "1:878741315473:web:b825cb3d5aae7088d10430"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();