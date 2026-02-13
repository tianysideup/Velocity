import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AdminAuthProvider } from './contexts/AdminAuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import UserProtectedRoute from './components/UserProtectedRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import RentalsPage from './pages/RentalsPage'
import VehicleDetailsPage from './pages/VehicleDetailsPage'
import NotificationsPage from './pages/NotificationsPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import VehicleManagement from './pages/admin/VehicleManagement'
import RentalManagement from './pages/admin/RentalManagement'
import TestimonialManagement from './pages/admin/TestimonialManagement'
import ContactManagement from './pages/admin/ContactManagement'
import TestPage from './pages/TestPage'
import './App.css'

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';
  // const isVehicleDetailsRoute = location.pathname.startsWith('/vehicle/');

  return (
    <div className="app">
      {!isAdminRoute && !isAuthRoute && <Navbar />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Public Routes - Anyone can view */}
        <Route path="/rentals" element={<RentalsPage />} />
        <Route path="/vehicle/:id" element={<VehicleDetailsPage />} />
        <Route path="/test" element={<TestPage />} />
        
        {/* User Protected Routes */}
        <Route 
          path="/notifications" 
          element={<UserProtectedRoute><NotificationsPage /></UserProtectedRoute>} 
        />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/vehicles" 
          element={<ProtectedRoute><VehicleManagement /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/rentals" 
          element={<ProtectedRoute><RentalManagement /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/testimonials" 
          element={<ProtectedRoute><TestimonialManagement /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/contacts" 
          element={<ProtectedRoute><ContactManagement /></ProtectedRoute>} 
        />
      </Routes>

      {!isAdminRoute && !isAuthRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminAuthProvider>
          <AppContent />
        </AdminAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App
