import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Menu,
  X,
  LayoutDashboard,
  Receipt,
  UtensilsCrossed,
  MonitorPlay,
  Wallet,
  Settings,
  LogOut,
} from "lucide-react";

export function AdminLayout() {
  const [menuAberto, setMenuAberto] = useState(false);
  const { usuario, signOut } = useAuth();
  const location = useLocation();

  const links = [
    {
      nome: "Dashboard",
      path: "/admin/dashboard",
      icone: <LayoutDashboard size={20} />,
    },
    { nome: "Pedidos", path: "/admin/pedidos", icone: <Receipt size={20} /> },
    {
      nome: "Cardápio",
      path: "/admin/cardapio",
      icone: <UtensilsCrossed size={20} />,
    },
    { nome: "Mesas", path: "/admin/mesas", icone: <MonitorPlay size={20} /> },
    {
      nome: "Financeiro",
      path: "/admin/financeiro",
      icone: <Wallet size={20} />,
    },
    {
      nome: "Configurações",
      path: "/admin/configuracoes",
      icone: <Settings size={20} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {menuAberto && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMenuAberto(false)}
        />
      )}

      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${menuAberto ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0
      `}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center gap-2 text-red-600 font-bold text-xl">
            <UtensilsCrossed size={24} />
            Click Menu
          </div>
          <button
            onClick={() => setMenuAberto(false)}
            className="md:hidden text-gray-500 hover:text-red-600"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {links.map((link) => {
            const ativo = location.pathname.includes(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuAberto(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${
                  ativo
                    ? "bg-red-50 text-red-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-red-600"
                }`}
              >
                {link.icone}
                {link.nome}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuAberto(true)}
              className="md:hidden text-gray-600 hover:text-red-600 focus:outline-none"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold text-gray-800 hidden md:block">
              Painel de Controle
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {usuario?.nome}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {usuario?.tipo}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold uppercase border border-red-200">
              {usuario?.nome?.charAt(0) || "A"}
            </div>

            <button
              onClick={signOut}
              title="Sair do sistema"
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
