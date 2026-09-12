import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import AdminNavbar from './components/AdminNavbar';
import AdminSidebar from './components/AdminSidebar';

import AdminLogin from './pages/Auth/AdminLogin';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import UsersManagement from './pages/Users/UsersManagement';
import CategoriesManagement from './pages/Categories/CategoriesManagement';
import MockTestsManagement from './pages/MockTests/MockTestsManagement';
import PracticeManagement from './pages/Practice/PracticeManagement';
import ResourcesManagement from './pages/Resources/ResourcesManagement';
import JobsManagement from './pages/Jobs/JobsManagement';
import PlatformAnalytics from './pages/Analytics/PlatformAnalytics';
import TransactionsManagement from './pages/Transactions/TransactionsManagement';
import ChatMessages from './pages/Chat/ChatMessages';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex transition-colors">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <AdminNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AdminLogin />} />
            <Route
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/transactions" element={<TransactionsManagement />} />
              <Route path="/chat" element={<ChatMessages />} />
              <Route path="/users" element={<UsersManagement />} />
              <Route path="/categories" element={<CategoriesManagement />} />
              <Route path="/tests" element={<MockTestsManagement />} />
              <Route path="/practice" element={<PracticeManagement />} />
              <Route path="/resources" element={<ResourcesManagement />} />
              <Route path="/jobs" element={<JobsManagement />} />
              <Route path="/analytics" element={<PlatformAnalytics />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

