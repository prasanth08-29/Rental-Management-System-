import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const token = sessionStorage.getItem('token');
    const userRole = sessionStorage.getItem('userRole');

    // Check for token existence
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Check for admin role
    if (userRole !== 'admin') {
        // If logged in but not admin, redirect to home or show unauthorized
        // For now, redirecting to home (Client Booking)
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
