import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

interface UserProtectedRouteProps {
  children: ReactNode;
}

const UserProtectedRoute = ({ children }: UserProtectedRouteProps) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#030303',
        color: '#fefefe'
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  return currentUser ? <>{children}</> : <Navigate to="/register" />;
};

export default UserProtectedRoute;
