import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MenuManagementPage from './pages/MenuManagementPage';
import MenuFormPage from './pages/MenuFormPage';
import ProductionPage from './pages/ProductionPage';
import ProductionFormPage from './pages/ProductionFormPage';
import InventoryPage from './pages/InventoryPage';
import InventoryFormPage from './pages/InventoryFormPage';
import MyPage from './pages/MyPage';
import Layout from './components/Layout';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="menus" element={<MenuManagementPage />} />
            <Route path="menus/new" element={<MenuFormPage />} />
            <Route path="menus/:id/edit" element={<MenuFormPage />} />
            <Route path="production" element={<ProductionPage />} />
            <Route path="production/new" element={<ProductionFormPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="inventory/new" element={<InventoryFormPage />} />
            <Route path="mypage" element={<MyPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
