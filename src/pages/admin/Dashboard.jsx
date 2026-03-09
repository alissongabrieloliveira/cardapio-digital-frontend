import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { format, subDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  TrendingUp,
  ShoppingBag,
  MonitorPlay,
  Clock,
  ChevronRight,
  Loader2,
  ChefHat,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function Dashboard() {
  const { usuario } = useAuth();
  const [carregando, setCarregando] = useState(true);

  const [faturamentoHoje, setFaturamentoHoje] = useState(0);
  const [pedidosAtivos, setPedidosAtivos] = useState(0);
  const [mesasAbertas, setMesasAbertas] = useState(0);
  const [ultimosPedidos, setUltimosPedidos] = useState([]);

  const [dadosGrafico, setDadosGrafico] = useState([]);

  useEffect(() => {
    async function carregarDashboard() {
      try {
        setCarregando(true);

        const hojeObj = new Date();
        const hojeStr = format(hojeObj, "yyyy-MM-dd");
        const seteDiasAtrasStr = format(subDays(hojeObj, 6), "yyyy-MM-dd");

        const [respFinancasHoje, respFinancas7Dias, respPedidos, respMesas] =
          await Promise.all([
            api.get("/financeiro", {
              params: { data_inicio: hojeStr, data_fim: hojeStr },
            }),
            api.get("/financeiro", {
              params: { data_inicio: seteDiasAtrasStr, data_fim: hojeStr },
            }),
            api.get("/pedidos"),
            api.get("/mesas"),
          ]);

        setFaturamentoHoje(respFinancasHoje.data.resumo.total_entradas);

        const movimentacoes = respFinancas7Dias.data.movimentacoes;
        const arrayGrafico = [];

        for (let i = 6; i >= 0; i--) {
          const dataAlvo = subDays(hojeObj, i);
          arrayGrafico.push({
            dataStr: format(dataAlvo, "yyyy-MM-dd"),
            diaSemana: format(dataAlvo, "EEEE", { locale: ptBR }).split("-")[0],
            valor: 0,
          });
        }

        movimentacoes.forEach((mov) => {
          if (mov.tipo === "entrada") {
            const dataMov = format(parseISO(mov.created_at), "yyyy-MM-dd");
            const diaIndex = arrayGrafico.findIndex(
              (d) => d.dataStr === dataMov,
            );
            if (diaIndex !== -1) {
              arrayGrafico[diaIndex].valor += Number(mov.valor);
            }
          }
        });

        const dadosFinaisGrafico = arrayGrafico.map((d) => ({
          name: d.diaSemana.charAt(0).toUpperCase() + d.diaSemana.slice(1),
          Vendas: d.valor,
        }));

        setDadosGrafico(dadosFinaisGrafico);

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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl text-sm border border-gray-700">
          <p className="font-bold text-gray-300 mb-1">{label}</p>
          <p className="font-black text-lg text-green-400">
            {formatarMoeda(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (carregando) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mr-2 w-8 h-8" /> Montando seu painel...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto space-y-6 pb-10">
      <div className="shrink-0">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Olá, {usuario?.nome?.split(" ")[0]}!
        </h1>
        <p className="text-gray-500 mt-1 text-lg font-medium">
          Aqui está o resumo da sua operação hoje,{" "}
          {format(new Date(), "d 'de' MMMM", { locale: ptBR })}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-green-50 p-3 rounded-xl text-green-600 group-hover:bg-green-100 transition-colors">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider">
              Faturamento Hoje
            </h3>
          </div>
          <p className="text-4xl font-black text-gray-900 tracking-tight">
            {formatarMoeda(faturamentoHoje)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-red-50 p-3 rounded-xl text-red-600 group-hover:bg-red-100 transition-colors">
              <ChefHat size={24} />
            </div>
            <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider">
              Na Cozinha
            </h3>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-gray-900 tracking-tight">
              {pedidosAtivos}
            </p>
            <p className="text-gray-400 mb-1 font-semibold text-sm">
              pedidos na fila
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
              <MonitorPlay size={24} />
            </div>
            <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider">
              Atendimento
            </h3>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-gray-900 tracking-tight">
              {mesasAbertas}
            </p>
            <p className="text-gray-400 mb-1 font-semibold text-sm">
              mesas abertas
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">
                Desempenho Semanal
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Vendas brutas dos últimos 7 dias
              </p>
            </div>
            <div className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-xs font-bold border border-green-100">
              Receitas
            </div>
          </div>

          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dadosGrafico}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Vendas"
                  stroke="#DC2626"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorVendas)"
                  activeDot={{
                    r: 6,
                    fill: "#DC2626",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-2 text-gray-800 font-bold text-lg">
              <Clock size={20} className="text-red-600" />
              Fila Recente
            </div>
            <Link
              to="/admin/pedidos"
              className="text-red-600 text-sm font-bold hover:text-red-700 flex items-center gap-1 transition-colors"
            >
              Ver Tudo <ChevronRight size={16} />
            </Link>
          </div>

          <div className="p-0 flex-1 overflow-y-auto custom-scrollbar">
            {ultimosPedidos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400">
                <ChefHat size={40} className="text-gray-200 mb-3" />
                <p className="font-medium">Nenhum pedido na fila no momento.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {ultimosPedidos.map((pedido) => (
                  <div
                    key={pedido.id}
                    className="p-4 flex flex-col gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-gray-900 text-sm">
                        {pedido.tipo === "mesa" ? `Mesa` : `Pedido`} #
                        {pedido.id.substring(0, 4).toUpperCase()}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${statusConfig[pedido.status]?.cor}`}
                      >
                        {statusConfig[pedido.status]?.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-xs text-gray-500 font-medium">
                        {new Date(pedido.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-sm font-black text-gray-700">
                        {formatarMoeda(pedido.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <Link
              to="/admin/mesas"
              className="w-full flex justify-center items-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-100 hover:text-red-600 transition-colors shadow-sm"
            >
              <MonitorPlay size={16} /> Abrir Nova Mesa
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
