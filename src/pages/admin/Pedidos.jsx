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
  CheckCircle,
  XCircle,
  Eye,
  X,
} from "lucide-react";

const COLUNAS_KANBAN = [
  {
    id: "pendente",
    titulo: "Novos",
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
  {
    id: "finalizado",
    titulo: "Finalizados",
    icone: CheckCircle,
    cor: "bg-gray-500",
    proximoStatus: null,
  },
  {
    id: "cancelado",
    titulo: "Cancelados",
    icone: XCircle,
    cor: "bg-red-500",
    proximoStatus: null,
  },
];

const formatarMoeda = (valor) =>
  Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function PedidoCard({ pedido, avancarStatus, abrirDetalhes }) {
  const [detalhes, setDetalhes] = useState(null);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);
  const isPendente = pedido.status === "pendente";

  useEffect(() => {
    if (isPendente && !detalhes) {
      buscarDetalhes();
    }
  }, [isPendente]);

  async function buscarDetalhes() {
    setCarregandoDetalhes(true);
    try {
      const resp = await api.get(`/pedidos/${pedido.id}`);
      setDetalhes(resp.data);
    } catch (error) {
      console.error("Erro ao buscar detalhes do pedido:", error);
    } finally {
      setCarregandoDetalhes(false);
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all flex flex-col gap-3">
      <div className="flex justify-between items-start">
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

      <div>
        <p className="font-bold text-gray-800 text-lg leading-tight">
          {pedido.tipo === "mesa"
            ? `Mesa ${detalhes?.mesa_numero || "..."}`
            : `Pedido #${pedido.id.substring(0, 4).toUpperCase()}`}
        </p>
        {!isPendente && (
          <p className="text-lg font-black text-green-600 mt-1">
            {formatarMoeda(pedido.total)}
          </p>
        )}
      </div>

      {isPendente && (
        <div className="bg-gray-50 border border-gray-100 rounded-md p-3 text-sm flex flex-col gap-2">
          {carregandoDetalhes ? (
            <p className="text-gray-400 text-xs animate-pulse">
              Carregando itens...
            </p>
          ) : (
            <>
              {pedido.tipo === "delivery" && detalhes?.cliente_nome && (
                <div className="text-gray-700 font-medium border-b border-gray-200 pb-2 mb-1">
                  Cliente:{" "}
                  <span className="font-bold">{detalhes.cliente_nome}</span>
                </div>
              )}

              <ul className="space-y-1.5">
                {detalhes?.itens?.map((item) => (
                  <li key={item.id} className="text-gray-700 leading-tight">
                    <span className="font-bold text-gray-900">
                      {item.quantidade}x
                    </span>{" "}
                    {item.nome_produto}
                    {item.adicionais?.length > 0 && (
                      <span className="text-xs text-gray-500 block ml-4">
                        +{" "}
                        {item.adicionais
                          .map((a) => a.nome_adicional)
                          .join(", ")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              {pedido.observacoes && (
                <p className="text-xs text-red-600 bg-red-50 p-1.5 rounded font-medium mt-1">
                  Obs: {pedido.observacoes}
                </p>
              )}

              <p className="text-right text-base font-black text-green-600 mt-2 border-t border-gray-200 pt-2">
                {formatarMoeda(pedido.total)}
              </p>
            </>
          )}
        </div>
      )}

      <div className="mt-auto pt-2 flex flex-col gap-2">
        {!isPendente && (
          <button
            onClick={() => abrirDetalhes(pedido.id)}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Eye size={16} /> Ver Detalhes
          </button>
        )}

        {pedido.status !== "finalizado" && pedido.status !== "cancelado" && (
          <button
            onClick={() => avancarStatus(pedido.id, pedido.status, pedido.tipo)}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
          >
            {isPendente ? "Aceitar e Preparar" : "Avançar Status"}
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

  async function carregarPedidos() {
    try {
      setCarregando(true);
      const resposta = await api.get("/pedidos");
      setPedidos(resposta.data);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
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
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoId ? { ...p, status: novoStatus } : p)),
      );
    } catch (error) {
      console.error("Erro ao avançar status:", error);
      alert("Erro ao avançar o pedido.");
    }
  }

  async function abrirDetalhes(pedidoId) {
    try {
      const resposta = await api.get(`/pedidos/${pedidoId}`);
      setPedidoSelecionado(resposta.data);
      setModalAberto(true);
    } catch (error) {
      console.error("Erro ao buscar detalhes:", error);
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
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
          className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm font-medium"
        >
          <RefreshCcw size={18} className={carregando ? "animate-spin" : ""} />
          Atualizar
        </button>
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto pb-4 items-start custom-scrollbar">
        {COLUNAS_KANBAN.map((coluna) => {
          const IconeColuna = coluna.icone;
          const pedidosDestaColuna = pedidos.filter(
            (p) => p.status === coluna.id,
          );

          return (
            <div
              key={coluna.id}
              className="min-w-[300px] max-w-[300px] flex-1 bg-gray-200/50 rounded-xl p-3 flex flex-col max-h-full"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`${coluna.cor} p-1.5 rounded-md text-white shadow-sm`}
                  >
                    <IconeColuna size={16} />
                  </div>
                  <h2 className="font-semibold text-gray-700">
                    {coluna.titulo}
                  </h2>
                </div>
                <span className="bg-white text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                  {pedidosDestaColuna.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {pedidosDestaColuna.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-6 border-2 border-dashed border-gray-300 rounded-lg">
                    Vazio
                  </div>
                ) : (
                  pedidosDestaColuna.map((pedido) => (
                    <PedidoCard
                      key={pedido.id}
                      pedido={pedido}
                      avancarStatus={avancarStatus}
                      abrirDetalhes={abrirDetalhes}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modalAberto && pedidoSelecionado && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-full">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">
                Detalhes do Pedido #
                {pedidoSelecionado.id.substring(0, 4).toUpperCase()}
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-gray-500 mb-1">Tipo de Pedido</p>
                  <p className="font-bold text-gray-800 capitalize">
                    {pedidoSelecionado.tipo}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-gray-500 mb-1">Pagamento</p>
                  <p className="font-bold text-gray-800 capitalize">
                    {pedidoSelecionado.forma_pagamento || "Na Mesa"}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">
                  Informações
                </h4>
                {pedidoSelecionado.tipo === "mesa" ? (
                  <p className="text-gray-700">
                    <span className="font-medium">Mesa:</span>{" "}
                    {pedidoSelecionado.mesa_numero}
                  </p>
                ) : (
                  <div className="text-gray-700 text-sm space-y-1">
                    <p>
                      <span className="font-medium">Cliente:</span>{" "}
                      {pedidoSelecionado.cliente_nome}
                    </p>
                    <p>
                      <span className="font-medium">Telefone:</span>{" "}
                      {pedidoSelecionado.cliente_telefone}
                    </p>
                    <p>
                      <span className="font-medium">Endereço:</span>{" "}
                      {pedidoSelecionado.rua},{" "}
                      {pedidoSelecionado.endereco_numero} -{" "}
                      {pedidoSelecionado.bairro}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">
                  Itens do Pedido
                </h4>
                <ul className="space-y-3">
                  {pedidoSelecionado.itens?.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between items-start text-sm"
                    >
                      <div>
                        <p className="font-bold text-gray-800">
                          {item.quantidade}x {item.nome_produto}
                        </p>
                        {item.adicionais?.map((adc) => (
                          <p
                            key={adc.adicional_id}
                            className="text-xs text-gray-500 ml-4"
                          >
                            + {adc.nome_adicional}
                          </p>
                        ))}
                      </div>
                      <span className="font-medium text-gray-600">
                        {formatarMoeda(item.preco_unitario * item.quantidade)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <span className="text-gray-500 font-medium">Total do Pedido</span>
              <span className="text-xl font-black text-green-600">
                {formatarMoeda(pedidoSelecionado.total)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
