import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'member' | 'moderator' | 'admin';
  lastSeen: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isModerator: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isModerator: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Sync user profile
        const userRef = doc(db, 'users', user.uid);
        
        // Use onSnapshot to get real-time role updates
        const unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // Create profile if it doesn't exist
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              role: 'member', // Default role
              lastSeen: serverTimestamp(),
            };
            setDoc(userRef, newProfile);
            setProfile(newProfile);
          }
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          setLoading(false);
        });

        return () => unsubscribeProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin' || user?.email === 'mushitujacques3@gmail.com', // Bootstrap admin
    isModerator: profile?.role === 'moderator' || profile?.role === 'admin' || user?.email === 'mushitujacques3@gmail.com',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
