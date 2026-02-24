import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";

// Pages
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import POSPage from "./pages/POSPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import ProductsPage from "./pages/admin/ProductsPage";
import OrdersPage from "./pages/admin/OrdersPage";
import UsersPage from "./pages/admin/UsersPage";
import SettingsPage from "./pages/admin/SettingsPage";

const AdminPage = ({ component: Component }) => (
  <ProtectedRoute allowedRoles={["admin"]}>
    <AdminLayout>
      <Component />
    </AdminLayout>
  </ProtectedRoute>
);

function App() {
  return (
    // SettingsProvider wraps everything so settings are available everywhere
    <SettingsProvider>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Admin pages */}
            <Route
              path="/dashboard"
              element={<AdminPage component={DashboardPage} />}
            />
            <Route
              path="/admin/categories"
              element={<AdminPage component={CategoriesPage} />}
            />
            <Route
              path="/admin/products"
              element={<AdminPage component={ProductsPage} />}
            />
            <Route
              path="/admin/orders"
              element={<AdminPage component={OrdersPage} />}
            />
            <Route
              path="/admin/users"
              element={<AdminPage component={UsersPage} />}
            />
            <Route
              path="/admin/settings"
              element={<AdminPage component={SettingsPage} />}
            />

            {/* POS */}
            <Route
              path="/pos"
              element={
                <ProtectedRoute allowedRoles={["admin", "cashier"]}>
                  <POSPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
