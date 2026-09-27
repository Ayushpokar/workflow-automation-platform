import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }: { children: ReactNode}){
    const { user, isLoading } = useAuth();

    if(isLoading){
        return <div className="flex justify-center items-center h-screen">Loading...</div>
    }

    if(!user){
        return <Navigate  to="/login" replace />
    }

    return  <>{children}</>;
}