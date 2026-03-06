import { useState, useEffect } from "react";
import { api } from "../../services/api";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Calendar,
  Loader2,
  X,
  Wallet,
} from "lucide-react";

export function Financeiro() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [resumo, setResumo] = useState({
    total_entradas: 0,
    total_saidas: 0,
    saldo_final: 0,
  });
  const [carregando, setCarregando] = useState(true);

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    tipo: "entrada",
    descricao: "",
    valor: "",
  });

  async function carregarFinanceiro(e) {
    if (e) e.preventDefault();

    try {
      setCarregando(true);

      const params = {};
      if (dataInicio) params.data_inicio = dataInicio;
      if (dataFim) params.data_fim = dataFim;

      const resposta = await api.get("/financeiro", { params });

      setMovimentacoes(resposta.data.movimentacoes);
      setResumo(resposta.data.resumo);
    } catch (error) {
      console.error("Erro ao carregar financeiro:", error);
      alert("Erro ao carregar os dados financeiros.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarFinanceiro();
  }, []);

  async function salvarLancamento(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.post("/financeiro", {
        ...form,
        valor: Number(form.valor),
      });
      setModalAberto(false);
      setForm({ tipo: "entrada", descricao: "", valor: "" });
      carregarFinanceiro();
    } catch (error) {
      alert(error.response?.data?.erro || "Erro ao registrar lançamento.");
    } finally {
      setSalvando(false);
    }
  }

  const formatarMoeda = (valor) =>
    Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  const formatarData = (dataIso) =>
    new Date(dataIso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Financeiro</h1>
          <p className="text-gray-500 text-sm mt-1">
            Acompanhe o fluxo de caixa do seu estabelecimento.
          </p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="flex justify-center items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm font-medium w-full sm:w-auto"
        >
          <Plus size={18} /> Novo Lançamento
        </button>
      </div>

      {carregando && movimentacoes.length === 0 ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-gray-400 w-8 h-8" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-gray-500 font-medium">Total de Entradas</h3>
              </div>
              <p className="text-3xl font-black text-gray-800">
                {formatarMoeda(resumo.total_entradas)}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-red-100 p-2 rounded-full text-red-600">
                  <TrendingDown size={24} />
                </div>
                <h3 className="text-gray-500 font-medium">Total de Saídas</h3>
              </div>
              <p className="text-3xl font-black text-gray-800">
                {formatarMoeda(resumo.total_saidas)}
              </p>
            </div>

            <div
              className={`p-6 rounded-xl border shadow-sm flex flex-col justify-center ${resumo.saldo_final >= 0 ? "bg-gray-900 border-gray-800" : "bg-red-600 border-red-700"}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2 rounded-full text-white">
                  <Wallet size={24} />
                </div>
                <h3 className="text-white/80 font-medium">Saldo do Período</h3>
              </div>
              <p className="text-3xl font-black text-white">
                {formatarMoeda(resumo.saldo_final)}
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col flex-1 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center gap-4 justify-between">
              <h2 className="font-bold text-gray-700">
                Extrato de Movimentações
              </h2>

              <form
                onSubmit={carregarFinanceiro}
                className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto"
              >
                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-red-500">
                  <Calendar size={16} className="text-gray-400" />
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="text-sm outline-none bg-transparent text-gray-700"
                  />
                </div>
                <span className="text-gray-400">até</span>
                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-red-500">
                  <Calendar size={16} className="text-gray-400" />
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="text-sm outline-none bg-transparent text-gray-700"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gray-800 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors"
                >
                  Filtrar
                </button>
                {(dataInicio || dataFim) && (
                  <button
                    type="button"
                    onClick={() => {
                      setDataInicio("");
                      setDataFim("");
                      setTimeout(carregarFinanceiro, 100);
                    }}
                    className="text-gray-500 hover:text-red-600 px-2 py-1.5 text-sm underline"
                  >
                    Limpar
                  </button>
                )}
              </form>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Data / Hora</th>
                    <th className="p-4 font-semibold">Descrição</th>
                    <th className="p-4 font-semibold text-center">Tipo</th>
                    <th className="p-4 font-semibold text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {movimentacoes.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-400">
                        Nenhuma movimentação encontrada neste período.
                      </td>
                    </tr>
                  ) : (
                    movimentacoes.map((mov) => (
                      <tr
                        key={mov.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                          {formatarData(mov.created_at)}
                        </td>
                        <td className="p-4 text-sm text-gray-800 font-medium">
                          {mov.descricao}
                          {mov.pedido_id && (
                            <span className="ml-2 inline-block bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                              Pedido Automático
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {mov.tipo === "entrada" ? (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase">
                              <TrendingUp size={12} /> Entrada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase">
                              <TrendingDown size={12} /> Saída
                            </span>
                          )}
                        </td>
                        <td
                          className={`p-4 text-right font-black ${mov.tipo === "entrada" ? "text-green-600" : "text-red-600"}`}
                        >
                          {mov.tipo === "saida" ? "- " : "+ "}
                          {formatarMoeda(mov.valor)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-800">
                Novo Lançamento
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={salvarLancamento} className="p-4 space-y-4">
              <div className="flex gap-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="tipo"
                    value="entrada"
                    checked={form.tipo === "entrada"}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="peer sr-only"
                  />
                  <div className="text-center py-2 px-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 peer-checked:bg-green-50 peer-checked:border-green-500 peer-checked:text-green-700 transition-colors">
                    Entrada
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="tipo"
                    value="saida"
                    checked={form.tipo === "saida"}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="peer sr-only"
                  />
                  <div className="text-center py-2 px-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 peer-checked:bg-red-50 peer-checked:border-red-500 peer-checked:text-red-700 transition-colors">
                    Saída
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={form.descricao}
                  onChange={(e) =>
                    setForm({ ...form, descricao: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="Ex: Pagamento fornecedor, Troco inicial..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor (R$)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={form.valor}
                    onChange={(e) =>
                      setForm({ ...form, valor: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={salvando}
                className="w-full bg-red-600 text-white py-2.5 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 mt-2"
              >
                {salvando ? "Registrando..." : "Registrar Lançamento"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
