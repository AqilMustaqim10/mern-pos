import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";

// Pages
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import POSPage from "./pages/POSPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import ProductsPage from "./pages/admin/ProductsPage";
import OrdersPage from "./pages/admin/OrdersPage";

// Helper component — wraps admin pages with the sidebar layout
// Keeps App.jsx clean and avoids repeating AdminLayout everywhere
const AdminPage = ({ component: Component }) => (
  <ProtectedRoute allowedRoles={["admin"]}>
    <AdminLayout>
      <Component />
    </AdminLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin pages — all wrapped in AdminLayout with sidebar */}
          <Route
            path="/dashboard"
            element={<AdminPage component={DashboardPage} />}
          />
          <Route
            path="/admin/orders"
            element={<AdminPage component={OrdersPage} />}
          />
          <Route
            path="/admin/categories"
            element={<AdminPage component={CategoriesPage} />}
          />
          <Route
            path="/admin/products"
            element={<AdminPage component={ProductsPage} />}
          />

          {/* Cashier/Admin POS Screen */}
          <Route
            path="/pos"
            element={
              <ProtectedRoute allowedRoles={["admin", "cashier"]}>
                <POSPage />
              </ProtectedRoute>
            }
          />

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
