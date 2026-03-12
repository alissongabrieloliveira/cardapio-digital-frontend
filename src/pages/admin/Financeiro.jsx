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
  Download,
  Filter,
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
  const [filtroAtivo, setFiltroAtivo] = useState("todos");

  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    tipo: "entrada",
    descricao: "",
    valor: "",
  });

  async function carregarFinanceiro(inicio = dataInicio, fim = dataFim) {
    try {
      setCarregando(true);
      const params = {};
      if (inicio) params.data_inicio = inicio;
      if (fim) params.data_fim = fim;

      const resposta = await api.get("/financeiro", { params });

      setMovimentacoes(resposta.data.movimentacoes);
      setResumo(resposta.data.resumo);
    } catch (error) {
      console.error("Erro ao carregar financeiro:", error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarFinanceiro();
  }, []);

  function aplicarFiltroRapido(tipo) {
    setFiltroAtivo(tipo);
    const hoje = new Date();
    const fim = hoje.toISOString().split("T")[0];
    let inicio = "";

    if (tipo === "hoje") {
      inicio = fim;
    } else if (tipo === "7dias") {
      const seteDias = new Date();
      seteDias.setDate(hoje.getDate() - 6);
      inicio = seteDias.toISOString().split("T")[0];
    } else if (tipo === "30dias") {
      const trintaDias = new Date();
      trintaDias.setDate(hoje.getDate() - 29);
      inicio = trintaDias.toISOString().split("T")[0];
    }

    setDataInicio(inicio);
    setDataFim(fim);
    carregarFinanceiro(inicio, fim);
  }

  function handleFiltroCustomizado(e) {
    e.preventDefault();
    setFiltroAtivo("custom");
    carregarFinanceiro(dataInicio, dataFim);
  }

  function limparFiltro() {
    setFiltroAtivo("todos");
    setDataInicio("");
    setDataFim("");
    carregarFinanceiro("", "");
  }

  function exportarCSV() {
    if (movimentacoes.length === 0)
      return alert("Não há dados para exportar neste período.");

    const cabecalho = "Data,Hora,Descricao,Tipo,Valor(R$)\n";
    const linhas = movimentacoes
      .map((m) => {
        const dataObj = new Date(m.created_at);
        const dataStr = dataObj.toLocaleDateString("pt-BR");
        const horaStr = dataObj.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        const valorLimpo = Number(m.valor).toFixed(2);
        const tipoLabel = m.tipo === "entrada" ? "Receita" : "Despesa";

        return `"${dataStr}","${horaStr}","${m.descricao}","${tipoLabel}","${m.tipo === "saida" ? "-" : ""}${valorLimpo}"`;
      })
      .join("\n");

    const blob = new Blob([cabecalho + linhas], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Extrato_${dataInicio || "Total"}_a_${dataFim || "Total"}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function salvarLancamento(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.post("/financeiro", { ...form, valor: Number(form.valor) });
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
    <div className="flex flex-col h-full max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Financeiro
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            Controlo total de fluxo de caixa e exportação para contabilidade.
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={exportarCSV}
            className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm font-bold"
          >
            <Download size={18} /> Exportar CSV
          </button>
          <button
            onClick={() => setModalAberto(true)}
            className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-black transition-colors shadow-lg font-bold"
          >
            <Plus size={18} /> Novo Lançamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-50 p-2.5 rounded-xl text-green-600">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs">
              Total de Entradas
            </h3>
          </div>
          <p className="text-3xl font-black text-gray-900">
            {formatarMoeda(resumo.total_entradas)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-50 p-2.5 rounded-xl text-red-600">
              <TrendingDown size={24} />
            </div>
            <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs">
              Total de Saídas
            </h3>
          </div>
          <p className="text-3xl font-black text-gray-900">
            {formatarMoeda(resumo.total_saidas)}
          </p>
        </div>

        <div
          className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-center relative overflow-hidden ${resumo.saldo_final >= 0 ? "bg-green-600 border-green-700" : "bg-red-600 border-red-700"}`}
        >
          <div className="absolute -right-4 -top-4 opacity-10">
            <Wallet size={120} />
          </div>
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <div className="bg-white/20 p-2.5 rounded-xl text-white backdrop-blur-sm">
              <Wallet size={24} />
            </div>
            <h3 className="text-white/90 font-bold uppercase tracking-wider text-xs">
              Saldo do Período
            </h3>
          </div>
          <p className="text-4xl font-black text-white relative z-10">
            {formatarMoeda(resumo.saldo_final)}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col xl:flex-row items-center gap-4 justify-between">
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm w-full xl:w-auto overflow-x-auto">
            <button
              onClick={() => aplicarFiltroRapido("hoje")}
              className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${filtroAtivo === "hoje" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
            >
              Hoje
            </button>
            <button
              onClick={() => aplicarFiltroRapido("7dias")}
              className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${filtroAtivo === "7dias" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
            >
              7 Dias
            </button>
            <button
              onClick={() => aplicarFiltroRapido("30dias")}
              className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${filtroAtivo === "30dias" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
            >
              30 Dias
            </button>
            <button
              onClick={limparFiltro}
              className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${filtroAtivo === "todos" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
            >
              Todo o Período
            </button>
          </div>

          <form
            onSubmit={handleFiltroCustomizado}
            className="flex items-center gap-2 w-full xl:w-auto"
          >
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm focus-within:border-gray-400 transition-colors flex-1 xl:flex-none">
              <Calendar size={16} className="text-gray-400" />
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="text-sm outline-none bg-transparent text-gray-700 w-full"
              />
            </div>
            <span className="text-gray-400 font-medium">até</span>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm focus-within:border-gray-400 transition-colors flex-1 xl:flex-none">
              <Calendar size={16} className="text-gray-400" />
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="text-sm outline-none bg-transparent text-gray-700 w-full"
              />
            </div>
            <button
              type="submit"
              className="bg-gray-100 text-gray-700 p-2 rounded-xl hover:bg-gray-200 transition-colors border border-gray-200 shadow-sm"
              title="Filtrar Datas"
            >
              <Filter size={20} />
            </button>
          </form>
        </div>

        <div className="overflow-x-auto flex-1 custom-scrollbar">
          {carregando ? (
            <div className="flex justify-center items-center h-32 text-gray-400">
              <Loader2 className="animate-spin w-6 h-6" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Data e Hora</th>
                  <th className="px-6 py-4">Descrição</th>
                  <th className="px-6 py-4 text-center">Tipo</th>
                  <th className="px-6 py-4 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {movimentacoes.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="p-12 text-center text-gray-400 font-medium"
                    >
                      Nenhuma movimentação no período selecionado.
                    </td>
                  </tr>
                ) : (
                  movimentacoes.map((mov) => (
                    <tr
                      key={mov.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium whitespace-nowrap">
                        {formatarData(mov.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 font-bold">
                          {mov.descricao}
                        </p>
                        {mov.pedido_id && (
                          <span className="inline-flex mt-1 bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wide border border-gray-200">
                            ID Pedido: {mov.pedido_id.substring(0, 4)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {mov.tipo === "entrada" ? (
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase border border-green-100">
                            <TrendingUp size={12} /> Entrada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase border border-red-100">
                            <TrendingDown size={12} /> Saída
                          </span>
                        )}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-black text-lg tracking-tight ${mov.tipo === "entrada" ? "text-green-600" : "text-gray-900"}`}
                      >
                        {mov.tipo === "saida" ? "- " : "+ "}
                        {formatarMoeda(mov.valor)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="font-black text-lg text-gray-900">
                Registar Movimentação
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                className="bg-gray-100 p-1.5 rounded-full text-gray-500 hover:text-gray-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={salvarLancamento} className="p-5 space-y-5">
              <div className="flex p-1 bg-gray-100 rounded-xl">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="tipo"
                    value="entrada"
                    checked={form.tipo === "entrada"}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="peer sr-only"
                  />
                  <div className="text-center py-2 px-3 rounded-lg text-sm font-bold text-gray-500 peer-checked:bg-white peer-checked:text-green-600 peer-checked:shadow-sm transition-all">
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
                  <div className="text-center py-2 px-3 rounded-lg text-sm font-bold text-gray-500 peer-checked:bg-white peer-checked:text-red-600 peer-checked:shadow-sm transition-all">
                    Saída
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
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
                  placeholder="Ex: Conta de luz, Troco..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Valor
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
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
                    placeholder="0,00"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-colors text-sm font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={salvando}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black active:scale-95 transition-all disabled:opacity-70 mt-2 flex justify-center items-center gap-2 shadow-lg"
              >
                {salvando ? <Loader2 className="animate-spin w-5 h-5" /> : null}
                {salvando ? "A registar..." : "Confirmar Lançamento"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
