import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { FaLock, FaUser } from 'react-icons/fa';
import '../../styles/admin/AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { adminLogin, adminUser, loading } = useAdminAuth();
  const navigate = useNavigate();

  // Check if already logged in as admin
  useEffect(() => {
    if (loading) return; // Wait for auth to initialize
    
    if (adminUser) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [adminUser, loading, navigate]);

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
      const isAdmin = await adminLogin(email, password);
      console.log('Login returned isAdmin:', isAdmin);
      
      if (!isAdmin) {
        console.log('Not an admin account');
        setError('Access denied. Admin credentials required.');
        setSubmitting(false);
        return;
      }
      
      console.log('Admin login successful, navigating to dashboard');
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

  // Show loading while auth initializes
  if (loading) {
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
