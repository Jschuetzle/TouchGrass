import { UserContextType } from "@/common/types/contexts";
import { TouchgrassUser } from "@/common/types/user";
import { createContext, useContext, useState } from "react";

const UserContext = createContext<UserContextType>({
    touchgrassUser: null,
    setTouchgrassUser: (_) => {},
    loadingTouchgrassUser: false,
    setLoadingTouchgrassUser: (_) => {},
});

export const UserProvider = ({ children }: { children?: React.ReactNode }) => {
    const [touchgrassUser, setTouchgrassUser] = useState<TouchgrassUser | null>(null);
    const [loadingTouchgrassUser, setLoadingTouchgrassUser] = useState<boolean>(true);

    return (
        <UserContext.Provider
            value={{
                touchgrassUser: touchgrassUser,
                setTouchgrassUser: setTouchgrassUser,
                loadingTouchgrassUser: loadingTouchgrassUser,
                setLoadingTouchgrassUser: setLoadingTouchgrassUser,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}

export const useUserContext = () => useContext(UserContext);