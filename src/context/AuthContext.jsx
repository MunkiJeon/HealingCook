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
                // If checking userDoc fails, maybe we still allow login?
                // But for now, let's keep strict.
                // throw new Error('User data not found in Firestore.');
            }

            const fullUser = { ...firebaseUser, ...userDoc };
            setUser(fullUser);
            return fullUser;
        } catch (error) {
            throw error;
        }
    };

    const bypassLogin = () => {
        // Dev Only: sets a mock user
        const mockUser = {
            uid: 'bypass-user-id',
            email: 'admin@healingcook.com',
            name: '개발자(ByPass)',
            branch: '용호동점',
            role: '매니저'
        };
        setUser(mockUser);
        return mockUser;
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
        <AuthContext.Provider value={{ user, login, logout, bypassLogin, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
