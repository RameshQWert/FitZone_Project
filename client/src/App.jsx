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
const ClassBooking = lazy(() => import('./pages/ClassBooking'));
const BookingHistory = lazy(() => import('./pages/BookingHistory'));

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
const TrainerChat = lazy(() => import('./pages/admin/TrainerChat'));
const AdminSiteContent = lazy(() => import('./pages/admin/SiteContent'));
const TrainerClasses = lazy(() => import('./pages/admin/TrainerClasses'));
const ClassBookings = lazy(() => import('./pages/admin/ClassBookings'));

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

// Admin Only Route - Redirect trainers from admin-only pages
const AdminOnlyRoute = memo(({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <PageLoader />;
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/admin" replace />;
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
          <Route path="/book-class/:classId" element={<ProtectedRoute><ClassBooking /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />
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
          
          {/* Trainer-specific routes */}
          <Route path="my-classes" element={<TrainerClasses />} />
          <Route path="class-bookings" element={<ClassBookings />} />
          <Route path="chat" element={<AdminChat />} />
          <Route path="trainer-chat" element={<TrainerChat />} />
          
          {/* Admin-only routes */}
          <Route path="members" element={<AdminOnlyRoute><AdminMembers /></AdminOnlyRoute>} />
          <Route path="trainers" element={<AdminOnlyRoute><AdminTrainers /></AdminOnlyRoute>} />
          <Route path="plans" element={<AdminOnlyRoute><AdminPlans /></AdminOnlyRoute>} />
          <Route path="equipment" element={<AdminOnlyRoute><AdminEquipment /></AdminOnlyRoute>} />
          <Route path="payments" element={<AdminOnlyRoute><AdminPayments /></AdminOnlyRoute>} />
          <Route path="reports" element={<AdminOnlyRoute><AdminReports /></AdminOnlyRoute>} />
          <Route path="settings" element={<AdminOnlyRoute><AdminSettings /></AdminOnlyRoute>} />
          <Route path="attendance" element={<AdminOnlyRoute><AdminAttendance /></AdminOnlyRoute>} />
          <Route path="qr-display" element={<AdminOnlyRoute><AdminQRDisplay /></AdminOnlyRoute>} />
          <Route path="site-content" element={<AdminOnlyRoute><AdminSiteContent /></AdminOnlyRoute>} />
          
          {/* Store Management Routes - Admin only */}
          <Route path="store" element={<AdminOnlyRoute><AdminStoreDashboard /></AdminOnlyRoute>} />
          <Route path="store/products" element={<AdminOnlyRoute><AdminStoreProducts /></AdminOnlyRoute>} />
          <Route path="store/orders" element={<AdminOnlyRoute><AdminStoreOrders /></AdminOnlyRoute>} />
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
