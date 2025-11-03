import { FirebaseProviderData, FirebaseUser } from "@/common/types/auth";
import { UserContextType } from "@/common/types/contexts";
import { TouchgrassUser } from "@/common/types/user";
import { AuthService } from "@/services/auth";
import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext<UserContextType>({
    touchgrassUser: null,
    setTouchgrassUser: (_) => {},
    firebaseUser: null,
    firebaseProviderData: null,
    authenticationInProgress: false,
});

export const UserProvider = ({ children }: { children?: React.ReactNode }) => {
    const [touchgrassUser, setTouchgrassUser] = useState<TouchgrassUser | null>(null);

    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [firebaseProviderData, setFirebaseProviderData] = useState<FirebaseProviderData | null>(null);
    const [authenticationInProgress, setAuthenticationInProgress] = useState<boolean>(false);

    // to be called by Firebase when authentication state changes (signin/signout)
    const handleAuthStateChanged = async (firebaseUser: FirebaseUser | null): Promise<void> => {
        setAuthenticationInProgress(true);
        setFirebaseUser(firebaseUser);

        if (firebaseUser) {
            // obtain the provider data from the firebase user
            const idToken = await firebaseUser!.getIdTokenResult();
            const signInProvider = idToken.signInProvider;
            const allProviderData = firebaseUser!.providerData;

            for (const provider of allProviderData) {
            if (provider.providerId === signInProvider) {
                setFirebaseProviderData(provider);
            }
            }
        } 
        else {
            setFirebaseProviderData(null);
        }

        setAuthenticationInProgress(false);
    };
    
    useEffect(() => {
        (async () => {
            return await AuthService.onAuthStateChanged(handleAuthStateChanged);
        })();
    }, []);

    return (
        <UserContext.Provider
            value={{
                touchgrassUser,
                setTouchgrassUser,
                firebaseUser,
                firebaseProviderData,
                authenticationInProgress,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}

export const useUserContext = () => useContext(UserContext);