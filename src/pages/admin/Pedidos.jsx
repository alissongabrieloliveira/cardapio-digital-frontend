import { useState, useEffect } from "react";
import { api } from "../../services/api";
import {
  Clock,
  ChefHat,
  CheckCircle2,
  Bike,
  RefreshCcw,
  Utensils,
  MapPin,
  ChevronRight,
} from "lucide-react";

const COLUNAS_KANBAN = [
  {
    id: "pendente",
    titulo: "Novos / Pendentes",
    icone: Clock,
    cor: "bg-yellow-500",
    proximoStatus: "preparo",
  },
  {
    id: "preparo",
    titulo: "Em Preparo",
    icone: ChefHat,
    cor: "bg-blue-500",
    proximoStatus: "pronto",
  },
  {
    id: "pronto",
    titulo: "Prontos",
    icone: CheckCircle2,
    cor: "bg-green-500",
    proximoStatus: "entrega",
  },
  {
    id: "entrega",
    titulo: "Em Entrega",
    icone: Bike,
    cor: "bg-purple-500",
    proximoStatus: "finalizado",
  },
];

export function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  async function carregarPedidos() {
    try {
      setCarregando(true);
      const resposta = await api.get("/pedidos");
      setPedidos(resposta.data);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      alert("Não foi possível carregar os pedidos.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

  async function avancarStatus(pedidoId, statusAtual, tipoPedido) {
    try {
      let novoStatus = COLUNAS_KANBAN.find(
        (c) => c.id === statusAtual,
      )?.proximoStatus;

      if (tipoPedido === "mesa" && statusAtual === "pronto") {
        novoStatus = "finalizado";
      }

      if (!novoStatus) return;

      await api.patch(`/pedidos/${pedidoId}/status`, { status: novoStatus });

      if (novoStatus === "finalizado") {
        setPedidos((prev) => prev.filter((p) => p.id !== pedidoId));
      } else {
        setPedidos((prev) =>
          prev.map((p) =>
            p.id === pedidoId ? { ...p, status: novoStatus } : p,
          ),
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao avançar o pedido.");
    }
  }

  const formatarMoeda = (valor) => {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestão de Pedidos
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Acompanhe o fluxo da cozinha e entregas em tempo real.
          </p>
        </div>
        <button
          onClick={carregarPedidos}
          className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium"
        >
          <RefreshCcw size={18} className={carregando ? "animate-spin" : ""} />
          Atualizar
        </button>
      </div>

      <div className="flex flex-1 gap-6 overflow-x-auto pb-4 items-start">
        {COLUNAS_KANBAN.map((coluna) => {
          const IconeColuna = coluna.icone;
          const pedidosDestaColuna = pedidos.filter(
            (p) => p.status === coluna.id,
          );

          return (
            <div
              key={coluna.id}
              className="min-w-[320px] max-w-[320px] flex-1 bg-gray-200/50 rounded-xl p-4 flex flex-col max-h-full"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`${coluna.cor} p-1.5 rounded-md text-white`}>
                    <IconeColuna size={18} />
                  </div>
                  <h2 className="font-semibold text-gray-700">
                    {coluna.titulo}
                  </h2>
                </div>
                <span className="bg-white text-gray-600 px-2 py-0.5 rounded-full text-sm font-bold shadow-sm">
                  {pedidosDestaColuna.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {pedidosDestaColuna.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    Nenhum pedido aqui
                  </div>
                ) : (
                  pedidosDestaColuna.map((pedido) => (
                    <div
                      key={pedido.id}
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          {pedido.tipo === "mesa" ? (
                            <Utensils size={14} className="text-blue-600" />
                          ) : (
                            <MapPin size={14} className="text-red-600" />
                          )}
                          {pedido.tipo}
                        </div>
                        <span className="text-xs font-medium text-gray-400">
                          {new Date(pedido.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="font-bold text-gray-800 text-lg">
                          {pedido.tipo === "mesa"
                            ? `Mesa -`
                            : `Pedido #${pedido.id.substring(0, 4).toUpperCase()}`}
                        </p>
                        <p className="text-lg font-black text-green-600">
                          {formatarMoeda(pedido.total)}
                        </p>
                        {pedido.observacoes && (
                          <p className="text-xs text-red-500 bg-red-50 p-2 rounded mt-2 font-medium border border-red-100">
                            Obs: {pedido.observacoes}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          avancarStatus(pedido.id, pedido.status, pedido.tipo)
                        }
                        className="mt-auto w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-200 hover:border-red-200 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Avançar Status
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
