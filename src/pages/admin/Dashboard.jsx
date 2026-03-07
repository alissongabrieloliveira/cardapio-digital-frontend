import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  TrendingUp,
  ShoppingBag,
  MonitorPlay,
  Clock,
  ChevronRight,
  Loader2,
  ChefHat,
} from "lucide-react";

export function Dashboard() {
  const { usuario } = useAuth();
  const [carregando, setCarregando] = useState(true);

  const [faturamentoHoje, setFaturamentoHoje] = useState(0);
  const [pedidosAtivos, setPedidosAtivos] = useState(0);
  const [mesasAbertas, setMesasAbertas] = useState(0);
  const [ultimosPedidos, setUltimosPedidos] = useState([]);

  useEffect(() => {
    async function carregarDashboard() {
      try {
        setCarregando(true);

        const hoje = new Date().toISOString().split("T")[0];

        const [respFinancas, respPedidos, respMesas] = await Promise.all([
          api.get("/financeiro", {
            params: { data_inicio: hoje, data_fim: hoje },
          }),
          api.get("/pedidos"),
          api.get("/mesas"),
        ]);

        setFaturamentoHoje(respFinancas.data.resumo.total_entradas);

        const ativos = respPedidos.data.filter(
          (p) => !["finalizado", "cancelado"].includes(p.status),
        );
        setPedidosAtivos(ativos.length);

        setUltimosPedidos(ativos.slice(0, 5));

        const abertas = respMesas.data.filter((m) => m.status === "aberta");
        setMesasAbertas(abertas.length);
      } catch (error) {
        console.error("Erro ao carregar o dashboard:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarDashboard();
  }, []);

  const formatarMoeda = (valor) =>
    Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const statusConfig = {
    pendente: { cor: "bg-yellow-100 text-yellow-800", label: "Novo" },
    preparo: { cor: "bg-blue-100 text-blue-800", label: "Preparo" },
    pronto: { cor: "bg-green-100 text-green-800", label: "Pronto" },
    entrega: { cor: "bg-purple-100 text-purple-800", label: "Entrega" },
  };

  if (carregando) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mr-2 w-8 h-8" /> Montando seu painel...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Olá, {usuario?.nome?.split(" ")[0]}!
        </h1>
        <p className="text-gray-500 mt-1 text-lg">
          Aqui está o resumo da sua operação hoje,{" "}
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
          .
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-green-100 p-3 rounded-xl text-green-600">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-gray-600 font-semibold text-lg">Vendas Hoje</h3>
          </div>
          <p className="text-4xl font-black text-gray-900">
            {formatarMoeda(faturamentoHoje)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-red-100 p-3 rounded-xl text-red-600">
              <ChefHat size={24} />
            </div>
            <h3 className="text-gray-600 font-semibold text-lg">
              Pedidos em Andamento
            </h3>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-gray-900">{pedidosAtivos}</p>
            <p className="text-gray-500 mb-1 font-medium">na fila</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
              <MonitorPlay size={24} />
            </div>
            <h3 className="text-gray-600 font-semibold text-lg">
              Mesas Abertas
            </h3>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-gray-900">{mesasAbertas}</p>
            <p className="text-gray-500 mb-1 font-medium">atendendo</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-2 text-gray-800 font-bold text-lg">
              <Clock size={20} className="text-red-600" />
              Fila Recente
            </div>
            <Link
              to="/admin/pedidos"
              className="text-red-600 text-sm font-semibold hover:text-red-700 flex items-center gap-1"
            >
              Ver Kanban <ChevronRight size={16} />
            </Link>
          </div>

          <div className="p-0 flex-1 overflow-y-auto">
            {ultimosPedidos.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-medium">
                Nenhum pedido na fila no momento.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {ultimosPedidos.map((pedido) => (
                  <div
                    key={pedido.id}
                    className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-gray-900">
                        {pedido.tipo === "mesa" ? `Mesa` : `Pedido`} #
                        {pedido.id.substring(0, 4).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {new Date(pedido.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        • {formatarMoeda(pedido.total)}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusConfig[pedido.status]?.cor}`}
                    >
                      {statusConfig[pedido.status]?.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
          <h3 className="font-bold text-gray-800 text-lg mb-2">
            Acesso Rápido
          </h3>

          <Link
            to="/admin/mesas"
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group"
          >
            <div className="bg-gray-100 p-3 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
              <MonitorPlay size={20} />
            </div>
            <div>
              <p className="font-bold text-gray-800 group-hover:text-blue-700">
                Abrir Nova Mesa
              </p>
              <p className="text-sm text-gray-500">Gerar QR Code de acesso</p>
            </div>
          </Link>

          <Link
            to="/admin/cardapio"
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50 transition-colors group"
          >
            <div className="bg-gray-100 p-3 rounded-lg group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="font-bold text-gray-800 group-hover:text-red-700">
                Novo Produto
              </p>
              <p className="text-sm text-gray-500">
                Adicionar item ao cardápio
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
