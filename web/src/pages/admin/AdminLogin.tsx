import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaLock, FaUser } from 'react-icons/fa';
import '../../styles/admin/AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const { login, logout, currentUser, loading } = useAuth();
  const navigate = useNavigate();

  // Check if already logged in as admin (only after auth finishes loading)
  useEffect(() => {
    const checkRole = async () => {
      if (loading) return; // Wait for auth to initialize
      
      if (!currentUser) {
        setCheckingRole(false);
        return;
      }

      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../../config/firebase');
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();
        if (userData?.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Error checking role:', error);
      }
      setCheckingRole(false);
    };

    checkRole();
  }, [currentUser, loading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (submitting) return;

    try {
      setError('');
      setSubmitting(true);
      
      console.log('Attempting admin login with email:', email);
      const role = await login(email, password);
      console.log('Login returned role:', role);
      
      // Check if user (non-admin) is trying to login through admin page
      if (role !== 'admin') {
        console.log('Role is not admin, logging out. Role received:', role);
        await logout();
        setError('Access denied. Admin credentials required. Your account role: ' + (role || 'unknown'));
        setSubmitting(false);
        return;
      }
      
      console.log('Admin login successful, navigating to dashboard');
      // Admin user - navigate to dashboard
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else {
        setError('Failed to login. Please try again.');
      }
      setSubmitting(false);
    }
  };

  // Show loading while auth initializes or checking role
  if (loading || checkingRole) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f5f5f5'
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo-circle">
            <img src="/img/Logo.png" alt="Velocity Logo" />
          </div>
          <p>Access the Velocity admin dashboard</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">
              <FaUser /> Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="admin@velocity.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FaLock /> Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-btn" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p>Secure admin access only</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
