import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Login } from "../pages/admin/Login";
import { AdminLayout } from "../components/AdminLayout";
import { Pedidos } from "../pages/admin/Pedidos";

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

const DashboardAdmin = () => (
  <div>
    <h1 className="text-2xl font-bold">Resumo do Dia</h1>
    <p className="text-gray-600">Conteúdo do dashboard aqui.</p>
  </div>
);
const CardapioAdmin = () => (
  <div>
    <h1 className="text-2xl font-bold">Meu Cardápio</h1>
  </div>
);
const MesasAdmin = () => (
  <div>
    <h1 className="text-2xl font-bold">Gerenciar Mesas</h1>
  </div>
);
const FinanceiroAdmin = () => (
  <div>
    <h1 className="text-2xl font-bold">Extrato Financeiro</h1>
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

        <Route path="/admin/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardAdmin />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="cardapio" element={<CardapioAdmin />} />
          <Route path="mesas" element={<MesasAdmin />} />
          <Route path="financeiro" element={<FinanceiroAdmin />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
