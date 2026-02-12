import { NavLink } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { FaTachometerAlt, FaCar, FaComments, FaEnvelope, FaSignOutAlt, FaReceipt } from 'react-icons/fa';
import '../styles/admin/AdminSidebar.css';

interface AdminSidebarProps {
  onLogout: () => void;
}

const AdminSidebar = ({ onLogout }: AdminSidebarProps) => {
  const { adminUser } = useAdminAuth();

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <img src="/img/Logo.png" alt="Velocity" className="sidebar-logo" />
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/admin/dashboard" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaTachometerAlt />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/admin/vehicles" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaCar />
          <span>Vehicles</span>
        </NavLink>

        <NavLink 
          to="/admin/rentals" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaReceipt />
          <span>Rentals</span>
        </NavLink>

        <NavLink 
          to="/admin/testimonials" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaComments />
          <span>Testimonials</span>
        </NavLink>

        <NavLink 
          to="/admin/contacts" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaEnvelope />
          <span>Messages</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-details">
            <p className="user-email">{adminUser?.email}</p>
            <p className="user-role">Administrator</p>
          </div>
        </div>
        <button onClick={onLogout} className="sidebar-logout">
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
