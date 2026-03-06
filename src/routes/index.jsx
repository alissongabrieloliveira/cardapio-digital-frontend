import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function PrivateRoute({ children }) {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Carregando...
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

const LoginAdmin = () => (
  <div className="p-8 text-xl font-bold">
    Tela de Login do Admin (Em construção)
  </div>
);
const DashboardAdmin = () => (
  <div className="p-8 text-xl font-bold text-green-600">
    Dashboard Privado (Em construção)
  </div>
);
const CardapioCliente = () => (
  <div className="p-8 text-xl font-bold text-blue-600">
    Cardápio do Cliente (Público)
  </div>
);

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/menu/:slug" element={<CardapioCliente />} />

        <Route path="/admin/login" element={<LoginAdmin />} />

        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <DashboardAdmin />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
