import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fica escutando as mudanças de estado do usuário (se logou ou deslogou)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Busca os dados adicionais no Firestore
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            setUserData(null);
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, password, userData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Salva os dados adicionais do usuário no Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      nome: userData.nome,
      email: email,
      telefone: userData.telefone,
      empresa: userData.empresa,
      createdAt: serverTimestamp(),
      role: 'user'
    });
    
    return userCredential;
  };

  const updateUserProfile = async (updates) => {
    if (!currentUser) return;
    const docRef = doc(db, 'users', currentUser.uid);
    await updateDoc(docRef, updates);
    setUserData((prev) => ({ ...prev, ...updates }));
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    userData,
    login,
    register,
    updateUserProfile,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}