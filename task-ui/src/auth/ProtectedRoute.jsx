import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();
    // console.log("isAuth", isAuthenticated);
    // console.log("token", localStorage.getItem("token"));
    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }
    return <Outlet />
}

export default ProtectedRoute;