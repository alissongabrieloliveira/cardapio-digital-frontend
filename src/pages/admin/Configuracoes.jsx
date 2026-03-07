import { useState, useEffect } from "react";
import { api } from "../../services/api";
import {
  Store,
  Link as LinkIcon,
  Image,
  Clock,
  Truck,
  Save,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export function Configuracoes() {
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    slogan: "",
    slug: "",
    logo_url: "",
    banner_url: "",
    horario_funcionamento: "",
    taxa_delivery_fixa: "",
    ativo: true,
  });

  useEffect(() => {
    async function carregarDados() {
      try {
        const resposta = await api.get("/estabelecimentos/me");
        const dados = resposta.data;

        setForm({
          nome: dados.nome || "",
          slogan: dados.slogan || "",
          slug: dados.slug || "",
          logo_url: dados.logo_url || "",
          banner_url: dados.banner_url || "",
          horario_funcionamento: dados.horario_funcionamento || "",
          taxa_delivery_fixa: dados.taxa_delivery_fixa || "",
          ativo: dados.ativo,
        });
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  async function salvarConfiguracoes(e) {
    e.preventDefault();
    setSalvando(true);
    setMensagemSucesso(false);

    try {
      const payload = {
        ...form,
        taxa_delivery_fixa: form.taxa_delivery_fixa
          ? Number(form.taxa_delivery_fixa)
          : 0,
      };

      await api.put("/estabelecimentos/me", payload);

      setMensagemSucesso(true);
      setTimeout(() => setMensagemSucesso(false), 4000);
    } catch (error) {
      alert(error.response?.data?.erro || "Erro ao salvar as configurações.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mr-2 w-8 h-8" /> Carregando
        configurações...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto pb-10">
      <div className="mb-8 shrink-0">
        <h1 className="text-2xl font-bold text-gray-800">
          Configurações do Estabelecimento
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Personalize a sua marca, links e taxas de entrega.
        </p>
      </div>

      {mensagemSucesso && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg flex items-center gap-3 shadow-sm animate-pulse">
          <CheckCircle2 className="text-green-600 w-6 h-6" />
          <p className="text-green-800 font-medium">
            Configurações atualizadas com sucesso!
          </p>
        </div>
      )}

      <form
        onSubmit={salvarConfiguracoes}
        className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar"
      >
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
            <Store className="text-red-600 w-5 h-5" />
            <h2 className="text-lg font-bold text-gray-800">
              Informações Básicas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Restaurante
              </label>
              <input
                type="text"
                name="nome"
                required
                value={form.nome}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slogan (Opcional)
              </label>
              <input
                type="text"
                name="slogan"
                value={form.slogan}
                onChange={handleChange}
                placeholder="Ex: A melhor pizza da cidade"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horário de Funcionamento
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="horario_funcionamento"
                  value={form.horario_funcionamento}
                  onChange={handleChange}
                  placeholder="Ex: Terça a Domingo, das 18h às 23h"
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
            <Truck className="text-red-600 w-5 h-5" />
            <h2 className="text-lg font-bold text-gray-800">
              Delivery & Link Público
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taxa de Delivery Fixa (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="taxa_delivery_fixa"
                value={form.taxa_delivery_fixa}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">
                Deixe 0 se o frete for grátis.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link Exclusivo (Slug)
              </label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent transition-shadow">
                <span className="bg-gray-100 text-gray-500 px-3 py-2 text-sm border-r border-gray-200">
                  seusaas.com/
                </span>
                <input
                  type="text"
                  name="slug"
                  required
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="nome-do-restaurante"
                  className="flex-1 px-3 py-2 bg-white outline-none text-sm font-medium text-gray-700"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Este é o link que você colocará no Instagram.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Status da Loja</h2>
            <p className="text-sm text-gray-500">
              Se desativado, os clientes não poderão acessar o cardápio público.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="ativo"
              checked={form.ativo}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={salvando}
            className="flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 active:scale-95 transition-all disabled:opacity-70"
          >
            {salvando ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {salvando ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
