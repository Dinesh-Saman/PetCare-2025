import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const VetProtectedRoute = ({ children }) => {
    const { vetUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        // You could return a loading spinner here
        return null;
    }

    if (!vetUser) {
        // Redirect to vet home page if not logged in
        return <Navigate to="/vet-home" state={{ from: location }} replace />;
    }

    return children;
};

export default VetProtectedRoute;
