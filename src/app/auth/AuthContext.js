import { useContext, useEffect, createContext, useState } from "react";
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    getIdToken,  
    getIdTokenResult 
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { setCookie, deleteCookie } from 'cookies-next'; 

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false); 

    const googleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        await setTokenCookie(result.user); 
    };

    const createUser = async (email, password) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await setTokenCookie(result.user); 
    };
  


    const signIn = async (email, password) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await setTokenCookie(result.user); // Set cookie with token
    };

    const logOut = () => {
        signOut(auth);
        setIsAdmin(false); 
        deleteCookie('userToken'); 
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                const tokenResult = await getIdTokenResult(currentUser); 
                setIsAdmin(!!tokenResult.claims.admin);
                await setTokenCookie(currentUser); 
            } else {
                setIsAdmin(false);
                deleteCookie('userToken'); 
            }
        });

        return () => unsubscribe();
    }, []);

    // Function to set the token cookie
    const setTokenCookie = async (user) => {
        const token = await getIdToken(user);
        setCookie('userToken', token, { maxAge: 60 * 60 * 24 }); // Token expires in 1 day
    };

    return (
        <AuthContext.Provider value={{ user, isAdmin, googleSignIn, createUser, signIn, logOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const UserAuth = () => {
    return useContext(AuthContext);
};
