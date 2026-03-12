import { useState, useEffect, useRef } from "react";
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
  Timer,
  AlertTriangle,
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
  Number(valor).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

const SOM_NOVO_PEDIDO =
  "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";

function PedidoCard({ pedido, avancarStatus, abrirDetalhes }) {
  const [detalhes, setDetalhes] = useState(null);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);
  const [minutosDecorridos, setMinutosDecorridos] = useState(0);

  const isPendente = pedido.status === "pendente";
  const isAtivo = !["finalizado", "cancelado"].includes(pedido.status);

  useEffect(() => {
    function calcularTempo() {
      const agora = new Date();
      const criacao = new Date(pedido.created_at);
      const diffMs = agora - criacao;
      const diffMinutos = Math.floor(diffMs / 60000);
      setMinutosDecorridos(diffMinutos);
    }

    calcularTempo();

    const intervalo = setInterval(calcularTempo, 60000);
    return () => clearInterval(intervalo);
  }, [pedido.created_at]);

  useEffect(() => {
    if (isPendente && !detalhes) buscarDetalhes();
  }, [isPendente]);

  async function buscarDetalhes() {
    setCarregandoDetalhes(true);
    try {
      const resp = await api.get(`/pedidos/${pedido.id}`);
      setDetalhes(resp.data);
    } catch (error) {
      console.error("Erro ao buscar detalhes:", error);
    } finally {
      setCarregandoDetalhes(false);
    }
  }

  let corTempo = "bg-gray-100 text-gray-600 border-gray-200";
  let alertaIcone = null;
  let bordaCartao = "border-gray-200";

  if (isAtivo) {
    if (minutosDecorridos >= 30) {
      corTempo = "bg-red-100 text-red-700 border-red-200 animate-pulse";
      alertaIcone = <AlertTriangle size={14} className="text-red-600 mr-1" />;
      bordaCartao = "border-red-400 shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]";
    } else if (minutosDecorridos >= 15) {
      corTempo = "bg-orange-100 text-orange-700 border-orange-200";
      bordaCartao = "border-orange-300";
    }
  }

  return (
    <div
      className={`bg-white p-4 rounded-xl shadow-sm border ${bordaCartao} hover:shadow-md transition-all flex flex-col gap-3 relative overflow-hidden`}
    >
      {isAtivo && minutosDecorridos >= 30 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-pulse" />
      )}

      <div className="flex justify-between items-start pt-1">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600 uppercase tracking-wide">
          {pedido.tipo === "mesa" ? (
            <Utensils size={14} className="text-blue-600" />
          ) : (
            <MapPin size={14} className="text-purple-600" />
          )}
          {pedido.tipo}
        </div>

        <div
          className={`flex items-center px-2 py-1 rounded border text-xs font-bold ${corTempo}`}
        >
          {alertaIcone || <Timer size={14} className="mr-1 opacity-70" />}
          {isAtivo
            ? minutosDecorridos === 0
              ? "Agora"
              : `${minutosDecorridos} min`
            : "Fechado"}
        </div>
      </div>

      <div>
        <p className="font-black text-gray-900 text-lg leading-tight mt-1">
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
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm flex flex-col gap-2">
          {carregandoDetalhes ? (
            <p className="text-gray-400 text-xs animate-pulse font-medium">
              A carregar itens...
            </p>
          ) : (
            <>
              {pedido.tipo === "delivery" && detalhes?.cliente_nome && (
                <div className="text-gray-700 font-medium border-b border-gray-200 pb-2 mb-1">
                  Cliente:{" "}
                  <span className="font-bold">{detalhes.cliente_nome}</span>
                </div>
              )}

              <ul className="space-y-2">
                {detalhes?.itens?.map((item) => (
                  <li
                    key={item.id}
                    className="text-gray-800 leading-tight border-b border-dashed border-gray-200 pb-2 last:border-0 last:pb-0"
                  >
                    <span className="font-black text-gray-900 bg-gray-200 px-1.5 py-0.5 rounded mr-1">
                      {item.quantidade}x
                    </span>
                    <span className="font-semibold">{item.nome_produto}</span>
                    {item.adicionais?.length > 0 && (
                      <span className="text-xs text-gray-500 block mt-1 ml-6">
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
                <p className="text-xs text-red-700 bg-red-50 p-2 rounded font-bold mt-1 border border-red-100">
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
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            <Eye size={16} /> Ver Detalhes
          </button>
        )}

        {pedido.status !== "finalizado" && pedido.status !== "cancelado" && (
          <button
            onClick={() => avancarStatus(pedido.id, pedido.status, pedido.tipo)}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-2.5 rounded-lg text-sm font-black transition-colors shadow-sm"
          >
            {isPendente ? "Aceitar e Preparar" : "Avançar Estado"}
            <ChevronRight size={18} />
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

  const pedidosConhecidosRef = useRef([]);

  async function carregarPedidos(isAutoRefresh = false) {
    try {
      if (!isAutoRefresh) setCarregando(true);
      const resposta = await api.get("/pedidos");
      const dados = resposta.data;

      const idsPendentesAtuais = dados
        .filter((p) => p.status === "pendente")
        .map((p) => p.id);

      if (pedidosConhecidosRef.current.length > 0) {
        const temNovo = idsPendentesAtuais.some(
          (id) => !pedidosConhecidosRef.current.includes(id),
        );
        if (temNovo) {
          const audio = new Audio(SOM_NOVO_PEDIDO);
          audio
            .play()
            .catch((e) =>
              console.log("Interação necessária para tocar som no navegador."),
            );
        }
      }

      pedidosConhecidosRef.current = idsPendentesAtuais;
      setPedidos(dados);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPedidos();
    const polling = setInterval(() => {
      carregarPedidos(true);
    }, 15000);
    return () => clearInterval(polling);
  }, []);

  async function avancarStatus(pedidoId, statusAtual, tipoPedido) {
    try {
      let novoStatus = COLUNAS_KANBAN.find(
        (c) => c.id === statusAtual,
      )?.proximoStatus;
      if (tipoPedido === "mesa" && statusAtual === "pronto")
        novoStatus = "finalizado";
      if (!novoStatus) return;

      await api.patch(`/pedidos/${pedidoId}/status`, { status: novoStatus });

      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoId ? { ...p, status: novoStatus } : p)),
      );

      if (statusAtual === "pendente") {
        pedidosConhecidosRef.current = pedidosConhecidosRef.current.filter(
          (id) => id !== pedidoId,
        );
      }
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
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Gestão de Pedidos
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium flex items-center gap-2">
            Acompanhe o fluxo.{" "}
            <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
              <RefreshCcw size={12} className="animate-spin" /> Auto-refresh
              ativo
            </span>
          </p>
        </div>
        <button
          onClick={() => carregarPedidos(false)}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 shadow-sm font-bold active:scale-95 transition-all"
        >
          <RefreshCcw size={18} className={carregando ? "animate-spin" : ""} />
          Sincronizar
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
              className="min-w-[320px] max-w-[320px] flex-1 bg-gray-100/80 rounded-2xl p-3 flex flex-col max-h-full border border-gray-200 shadow-inner"
            >
              <div className="flex items-center justify-between mb-3 px-1 pt-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`${coluna.cor} p-1.5 rounded-lg text-white shadow-sm`}
                  >
                    <IconeColuna size={18} />
                  </div>
                  <h2 className="font-black text-gray-700 tracking-wide">
                    {coluna.titulo}
                  </h2>
                </div>
                <span className="bg-white text-gray-600 px-2.5 py-1 rounded-md text-xs font-black shadow-sm border border-gray-200">
                  {pedidosDestaColuna.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {pedidosDestaColuna.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-10 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                    Nenhum pedido aqui
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-full animate-slide-up">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-black text-lg text-gray-900 tracking-tight">
                Detalhes do Pedido #
                {pedidoSelecionado.id.substring(0, 4).toUpperCase()}
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                className="bg-gray-200 p-1.5 rounded-full text-gray-500 hover:text-red-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                {pedidoSelecionado.tipo === "mesa" ? (
                  <p className="text-gray-800 font-medium">
                    <span className="font-black text-gray-500 mr-2">MESA</span>{" "}
                    {pedidoSelecionado.mesa_numero}
                  </p>
                ) : (
                  <div className="text-gray-800 text-sm space-y-2">
                    <p>
                      <span className="font-black text-gray-500 mr-2">
                        CLIENTE
                      </span>{" "}
                      {pedidoSelecionado.cliente_nome}
                    </p>
                    <p>
                      <span className="font-black text-gray-500 mr-2">
                        CONTATO
                      </span>{" "}
                      {pedidoSelecionado.cliente_telefone}
                    </p>
                    <p>
                      <span className="font-black text-gray-500 mr-2">
                        ENTREGA
                      </span>{" "}
                      {pedidoSelecionado.rua},{" "}
                      {pedidoSelecionado.endereco_numero} -{" "}
                      {pedidoSelecionado.bairro}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-black text-gray-800 border-b border-gray-100 pb-2 mb-4">
                  Itens Solicitados
                </h4>
                <ul className="space-y-4">
                  {pedidoSelecionado.itens?.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between items-start text-sm bg-white p-3 border border-gray-100 rounded-xl shadow-sm"
                    >
                      <div>
                        <p className="font-bold text-gray-900">
                          <span className="bg-gray-200 px-1.5 rounded mr-2">
                            {item.quantidade}x
                          </span>{" "}
                          {item.nome_produto}
                        </p>
                        {item.adicionais?.map((adc) => (
                          <p
                            key={adc.adicional_id}
                            className="text-xs text-gray-500 font-medium ml-8 mt-1"
                          >
                            + {adc.nome_adicional}
                          </p>
                        ))}
                      </div>
                      <span className="font-black text-gray-700">
                        {formatarMoeda(item.preco_unitario * item.quantidade)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-900 flex justify-between items-center text-white">
              <span className="font-medium text-gray-400">Total do Pedido</span>
              <span className="text-2xl font-black text-green-400">
                {formatarMoeda(pedidoSelecionado.total)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
