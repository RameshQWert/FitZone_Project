import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider, useAuth } from './context';

// Layouts
import { MainLayout, AuthLayout, AdminLayout } from './layouts';

// Pages
import { Home, About, Login, Register, Programs, Pricing, Trainers, Schedule, Contact } from './pages';

// Admin Pages
import {
  AdminDashboard,
  AdminMembers,
  AdminTrainers,
  AdminPlans,
  AdminClasses,
  AdminPayments,
  AdminReports,
  AdminSettings,
} from './pages/admin';

// Protected Route Component - Must be used inside AuthProvider
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Guest Route - Redirect authenticated users
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// App Routes Component - Wrapped inside AuthProvider
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes with Main Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/trainers" element={<Trainers />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Auth Routes - Only for guests */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      </Route>

      {/* Admin Routes - Protected for admin/trainer roles */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'trainer']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="members" element={<AdminMembers />} />
        <Route path="trainers" element={<AdminTrainers />} />
        <Route path="plans" element={<AdminPlans />} />
        <Route path="classes" element={<AdminClasses />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
