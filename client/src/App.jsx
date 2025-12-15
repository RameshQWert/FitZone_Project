import React, { Suspense, lazy, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider, useAuth, SocketProvider } from './context';

// Layouts - Keep these non-lazy as they're always needed
import { MainLayout, AuthLayout, AdminLayout, StoreLayout } from './layouts';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Programs = lazy(() => import('./pages/Programs'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Trainers = lazy(() => import('./pages/Trainers'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Contact = lazy(() => import('./pages/Contact'));
const Facilities = lazy(() => import('./pages/Facilities'));
const Profile = lazy(() => import('./pages/Profile'));
const MemberChat = lazy(() => import('./pages/MemberChat'));
const BMICalculator = lazy(() => import('./pages/BMICalculator'));

// Lazy load admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminMembers = lazy(() => import('./pages/admin/Members'));
const AdminTrainers = lazy(() => import('./pages/admin/Trainers'));
const AdminPlans = lazy(() => import('./pages/admin/Plans'));
const AdminEquipment = lazy(() => import('./pages/admin/Equipment'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminAttendance = lazy(() => import('./pages/admin/Attendance'));
const AdminQRDisplay = lazy(() => import('./pages/admin/QRDisplay'));
const AdminChat = lazy(() => import('./pages/admin/Chat'));
const AdminSiteContent = lazy(() => import('./pages/admin/SiteContent'));

// Lazy load admin store pages
const AdminStoreDashboard = lazy(() => import('./pages/admin/StoreDashboard'));
const AdminStoreProducts = lazy(() => import('./pages/admin/StoreProducts'));
const AdminStoreOrders = lazy(() => import('./pages/admin/StoreOrders'));

// Lazy load store pages
const Shop = lazy(() => import('./pages/store/Shop'));
const ProductDetail = lazy(() => import('./pages/store/ProductDetail'));
const Cart = lazy(() => import('./pages/store/Cart'));
const Checkout = lazy(() => import('./pages/store/Checkout'));
const MyOrders = lazy(() => import('./pages/store/MyOrders'));

// Member attendance scanner
const AttendanceScanner = lazy(() => import('./pages/AttendanceScanner'));

// Loading fallback component
const PageLoader = memo(() => (
  <div className="min-h-screen bg-dark-500 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
      <p className="text-gray-400 mt-4">Loading...</p>
    </div>
  </div>
));

// Protected Route Component - Must be used inside AuthProvider
const ProtectedRoute = memo(({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return <PageLoader />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
});

// Guest Route - Redirect authenticated users
const GuestRoute = memo(({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <PageLoader />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
});

// App Routes Component - Wrapped inside AuthProvider
const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes with Main Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/trainers" element={<Trainers />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/attendance-scanner" element={<ProtectedRoute><AttendanceScanner /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><MemberChat /></ProtectedRoute>} />
          <Route path="/bmi-calculator" element={<ProtectedRoute><BMICalculator /></ProtectedRoute>} />
        </Route>

        {/* Store Routes with StoreLayout */}
        <Route element={<StoreLayout />}>
          <Route path="/store" element={<Shop />} />
          <Route path="/store/product/:slug" element={<ProductDetail />} />
          <Route path="/store/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/store/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/store/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
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
          <Route path="equipment" element={<AdminEquipment />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="qr-display" element={<AdminQRDisplay />} />
          <Route path="chat" element={<AdminChat />} />
          <Route path="site-content" element={<AdminSiteContent />} />
          {/* Store Management Routes */}
          <Route path="store" element={<AdminStoreDashboard />} />
          <Route path="store/products" element={<AdminStoreProducts />} />
          <Route path="store/orders" element={<AdminStoreOrders />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
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
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
