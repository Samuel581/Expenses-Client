import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const PrivateRoute = () => {
    const {token} = useAuth(); //Cheks user login state
    return token ? <Outlet/> : <Navigate to="/" replace/>//Outlet works for any nested route that passes the login state, if user is not logged it goes directly into login or home
}

export default PrivateRoute;