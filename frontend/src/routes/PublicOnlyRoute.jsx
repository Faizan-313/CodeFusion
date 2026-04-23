import { Outlet, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function PublicOnlyRoute() {
    const { user } = useAuth();
    return user ? <Navigate to="/dashboard" /> : <Outlet />
}

export default PublicOnlyRoute
