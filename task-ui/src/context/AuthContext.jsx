import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { getCurrentUserDetails } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(
        () => localStorage.getItem("token")
    );

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(
        () => Boolean(localStorage.getItem("token"))
    );

    const updateUser = useCallback((updatedData) => {
        setUser((prev) => ({
            ...prev,
            ...updatedData,
        }));
    }, []);

    useEffect(() => {
        let isMounted = true;
        const initializeAuth = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }
            try {
                const response = await getCurrentUserDetails();
                if (isMounted) {
                    setUser(response.user ?? response);
                }
            } catch (error) {
                console.error("Authentication initialization failed:", error);
                if (isMounted) {
                    // Clear the session if the backend rejects the token.
                    if (error.status === 401) {
                        localStorage.removeItem("token");
                        setToken(null);
                    }
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        initializeAuth();
        return () => {
            isMounted = false;
        };
    }, [token]);

    const login = useCallback((authData) => {
        localStorage.setItem("token", authData.token);
        setToken(authData.token);
        setUser(authData.user);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        setIsLoading(false);
    }, []);

    const value = useMemo(() => ({
        token,
        user,
        login,
        logout,
        isLoading,
        isAuthenticated: Boolean(token && user),
        updateUser,
    }), [token, user, login, logout, isLoading, updateUser]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (context === null) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}