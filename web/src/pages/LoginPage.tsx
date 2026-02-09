import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, logout } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const role = await login(email, password);
      
      // Check if admin is trying to login through user page
      if (role === 'admin') {
        await logout();
        setError('Admin accounts must use the admin login page at /admin/login');
        setLoading(false);
        return;
      }
      
      // Regular user - navigate to rentals
      navigate('/rentals');
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <button className="back-button" onClick={() => navigate('/')}>
        <FaArrowLeft />
      </button>
      <div className="login-card">
        <div className="login-header">
          <img src="/img/Logo.png" alt="Velocity" className="login-logo" />
          <h2>Welcome Back</h2>
          <p>Login to your account to continue</p>
        </div>

        {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="login-footer">
            <p>Don't have an account? <Link to="/register">Sign up here</Link></p>
          </div>
        </div>
      </div>
    );
};

export default LoginPage;
