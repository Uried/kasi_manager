import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      return false;
    }
    
    try {
      const userData = JSON.parse(user);
      // Vérifier que l'utilisateur est un admin ou super_admin
      return (userData.role === 'admin' || userData.role === 'super_admin') && userData.isActive;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return false;
    }
  };

  if (!isAuthenticated()) {
    // Nettoyer le localStorage si les données sont invalides
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
