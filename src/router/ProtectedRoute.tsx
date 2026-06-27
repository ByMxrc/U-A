import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, userRole } = useApp();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (userRole !== 'organizador') return <Navigate to="/calendar" replace />;
  return <>{children}</>;
}
