import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { QRCodeSVG } from "qrcode.react";
import {
  Plus,
  Trash2,
  QrCode,
  Unlock,
  Lock,
  X,
  Loader2,
  MonitorPlay,
  ExternalLink,
} from "lucide-react";

export function Mesas() {
  const [mesas, setMesas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [modalNovaMesa, setModalNovaMesa] = useState(false);
  const [modalQrCode, setModalQrCode] = useState({ aberto: false, mesa: null });

  const [numeroMesa, setNumeroMesa] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregarMesas() {
    try {
      setCarregando(true);
      const resposta = await api.get("/mesas");
      setMesas(resposta.data);
    } catch (error) {
      console.error("Erro ao carregar mesas:", error);
      alert("Erro ao carregar as mesas.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarMesas();
  }, []);

  async function criarMesa(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.post("/mesas", { numero: Number(numeroMesa) });
      setModalNovaMesa(false);
      setNumeroMesa("");
      carregarMesas();
    } catch (error) {
      alert(error.response?.data?.erro || "Erro ao criar mesa.");
    } finally {
      setSalvando(false);
    }
  }

  async function abrirMesa(id) {
    try {
      await api.post(`/mesas/${id}/abrir`);
      carregarMesas();
    } catch (error) {
      alert("Erro ao abrir a mesa.");
    }
  }

  async function fecharMesa(id) {
    if (
      !confirm(
        "Tem certeza que deseja fechar esta mesa? O QR Code atual será invalidado.",
      )
    )
      return;
    try {
      await api.post(`/mesas/${id}/fechar`);
      carregarMesas();
    } catch (error) {
      alert("Erro ao fechar a mesa.");
    }
  }

  async function excluirMesa(id) {
    if (!confirm("Tem certeza que deseja excluir esta mesa?")) return;
    try {
      await api.delete(`/mesas/${id}`);
      carregarMesas();
    } catch (error) {
      alert(error.response?.data?.erro || "Erro ao excluir mesa.");
    }
  }

  const gerarUrlCliente = (token) => `${window.location.origin}/mesa/${token}`;

  if (carregando) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Carregando mesas...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gerenciar Mesas</h1>
          <p className="text-gray-500 text-sm mt-1">
            Controle o acesso e gere QR Codes dinâmicos.
          </p>
        </div>
        <button
          onClick={() => setModalNovaMesa(true)}
          className="flex justify-center items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm font-medium"
        >
          <Plus size={18} /> Nova Mesa
        </button>
      </div>

      {mesas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <MonitorPlay size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            Nenhuma mesa cadastrada
          </h3>
          <p className="text-gray-500 mt-1">
            Crie sua primeira mesa para começar a gerar QR Codes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto pb-8">
          {mesas.map((mesa) => {
            const isAberta = mesa.status === "aberta";

            return (
              <div
                key={mesa.id}
                className={`bg-white rounded-xl border flex flex-col overflow-hidden shadow-sm transition-all ${isAberta ? "border-red-300 ring-1 ring-red-100" : "border-gray-200 hover:border-gray-300"}`}
              >
                <div
                  className={`p-4 flex justify-between items-center border-b ${isAberta ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100"}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${isAberta ? "bg-red-600 text-white" : "bg-gray-200 text-gray-600"}`}
                    >
                      {mesa.numero}
                    </span>
                    <span
                      className={`font-semibold text-sm uppercase tracking-wider ${isAberta ? "text-red-700" : "text-gray-500"}`}
                    >
                      {mesa.status}
                    </span>
                  </div>

                  {!isAberta && (
                    <button
                      onClick={() => excluirMesa(mesa.id)}
                      className="text-gray-400 hover:text-red-600 p-1"
                      title="Excluir Mesa"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="p-4 flex flex-col gap-3 flex-1 justify-center">
                  {isAberta ? (
                    <>
                      <button
                        onClick={() => setModalQrCode({ aberto: true, mesa })}
                        className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-2 rounded-lg font-medium transition-colors"
                      >
                        <QrCode size={18} /> Ver QR Code
                      </button>
                      <button
                        onClick={() => fecharMesa(mesa.id)}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-lg font-medium transition-colors"
                      >
                        <Lock size={18} /> Fechar Mesa
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => abrirMesa(mesa.id)}
                      className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 py-3 rounded-lg font-semibold transition-colors"
                    >
                      <Unlock size={18} /> Abrir Mesa
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalNovaMesa && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg">Nova Mesa</h3>
              <button
                onClick={() => setModalNovaMesa(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={criarMesa} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número da Mesa
                </label>
                <input
                  type="number"
                  required
                  autoFocus
                  min="1"
                  value={numeroMesa}
                  onChange={(e) => setNumeroMesa(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="Ex: 12"
                />
              </div>
              <button
                type="submit"
                disabled={salvando}
                className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {salvando ? "Criando..." : "Criar Mesa"}
              </button>
            </form>
          </div>
        </div>
      )}

      {modalQrCode.aberto && modalQrCode.mesa && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col items-center text-center">
            <div className="w-full bg-red-600 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg">
                Mesa {modalQrCode.mesa.numero}
              </h3>
              <button
                onClick={() => setModalQrCode({ aberto: false, mesa: null })}
                className="text-white/80 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 flex flex-col items-center">
              <p className="text-sm text-gray-500 mb-6">
                Escaneie o código abaixo para acessar o cardápio e fazer
                pedidos.
              </p>

              <div className="bg-white p-3 rounded-xl border-2 border-gray-100 shadow-sm mb-6">
                <QRCodeSVG
                  value={gerarUrlCliente(modalQrCode.mesa.token_atual)}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <a
                href={gerarUrlCliente(modalQrCode.mesa.token_atual)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
              >
                Acessar Link Diretamente <ExternalLink size={16} />
              </a>
            </div>

            <div className="w-full p-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
              Token expira em:{" "}
              {new Date(modalQrCode.mesa.token_expira_em).toLocaleTimeString(
                [],
                { hour: "2-digit", minute: "2-digit" },
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
