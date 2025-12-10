import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { firestoreService } from '../services/firestoreService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userDoc = await firestoreService.getUser(firebaseUser.uid);
                    if (userDoc) {
                        setUser({ ...firebaseUser, ...userDoc });
                    } else {
                        // Fallback if user doc doesn't exist yet (shouldn't happen in normal flow if created properly)
                        setUser(firebaseUser);
                    }
                } catch (error) {
                    console.error("Error fetching user details:", error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            const userDoc = await firestoreService.getUser(firebaseUser.uid);

            if (!userDoc) {
                throw new Error('User data not found in Firestore.');
            }

            const fullUser = { ...firebaseUser, ...userDoc };
            setUser(fullUser);
            return fullUser;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
