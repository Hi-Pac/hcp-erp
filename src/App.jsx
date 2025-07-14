import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Inventory from './pages/Inventory';
import Accounting from './pages/Accounting';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import OrderTracking from './pages/OrderTracking';
import SalesReturns from './pages/SalesReturns';
import CustomerAccounts from './pages/CustomerAccounts';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="App">
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                fontFamily: 'Cairo, sans-serif',
                direction: 'rtl',
                textAlign: 'right'
              },
            }}
          />

          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Sales />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Customers />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Inventory />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounting"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Accounting />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredRole="Admin">
                  <Layout>
                    <Users />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute requiredRole="Supervisor">
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-tracking"
              element={
                <ProtectedRoute>
                  <Layout>
                    <OrderTracking />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales-returns"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SalesReturns />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer-accounts"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CustomerAccounts />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
