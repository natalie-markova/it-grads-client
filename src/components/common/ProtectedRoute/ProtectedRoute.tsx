import { Navigate, useOutletContext } from "react-router-dom";
import { OutletContext } from "../../../types";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user } = useOutletContext<OutletContext>();
    if (user) {
        return <>{children}</>;
    } else {
        return <Navigate to="/login" replace/>;
    }
}

export default ProtectedRoute;
