import { useState, useEffect } from "react";
import { api } from "../../services/api";
import {
  Plus,
  Edit,
  Trash2,
  UtensilsCrossed,
  Tag,
  DollarSign,
  X,
  Loader2,
} from "lucide-react";

export function Cardapio() {
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [modalCategoria, setModalCategoria] = useState({
    aberto: false,
    editando: null,
  });
  const [modalProduto, setModalProduto] = useState({
    aberto: false,
    editando: null,
  });

  const [formCategoria, setFormCategoria] = useState({ nome: "", ordem: 0 });
  const [formProduto, setFormProduto] = useState({
    nome: "",
    descricao: "",
    preco: "",
    categoria_id: "",
  });
  const [salvando, setSalvando] = useState(false);

  async function carregarDados() {
    try {
      setCarregando(true);

      const [respCat, respProd] = await Promise.all([
        api.get("/categorias"),
        api.get("/produtos"),
      ]);
      setCategorias(respCat.data);
      setProdutos(respProd.data);
    } catch (error) {
      console.error("Erro ao carregar cardápio:", error);
      alert("Erro ao carregar os dados do cardápio.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const formatarMoeda = (valor) =>
    Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  async function salvarCategoria(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      if (modalCategoria.editando) {
        await api.put(
          `/categorias/${modalCategoria.editando.id}`,
          formCategoria,
        );
      } else {
        await api.post("/categorias", formCategoria);
      }
      setModalCategoria({ aberto: false, editando: null });
      setFormCategoria({ nome: "", ordem: 0 });
      carregarDados();
    } catch (error) {
      alert("Erro ao salvar categoria.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirCategoria(id) {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    try {
      await api.delete(`/categorias/${id}`);
      carregarDados();
    } catch (error) {
      alert("Erro ao excluir categoria.");
    }
  }

  async function salvarProduto(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      const payload = {
        ...formProduto,
        preco: Number(formProduto.preco),
      };

      if (modalProduto.editando) {
        await api.put(`/produtos/${modalProduto.editando.id}`, payload);
      } else {
        await api.post("/produtos", payload);
      }
      setModalProduto({ aberto: false, editando: null });
      setFormProduto({ nome: "", descricao: "", preco: "", categoria_id: "" });
      carregarDados();
    } catch (error) {
      alert("Erro ao salvar produto. Verifique os dados.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirProduto(id) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      await api.delete(`/produtos/${id}`);
      carregarDados();
    } catch (error) {
      alert("Erro ao excluir produto.");
    }
  }

  if (carregando) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Carregando cardápio...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Meu Cardápio</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie suas categorias e produtos oferecidos.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setFormCategoria({ nome: "", ordem: 0 });
              setModalCategoria({ aberto: true, editando: null });
            }}
            className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium"
          >
            <Plus size={18} /> Categoria
          </button>
          <button
            onClick={() => {
              setFormProduto({
                nome: "",
                descricao: "",
                preco: "",
                categoria_id: categorias[0]?.id || "",
              });
              setModalProduto({ aberto: true, editando: null });
            }}
            disabled={categorias.length === 0}
            className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title={categorias.length === 0 ? "Crie uma categoria primeiro" : ""}
          >
            <Plus size={18} /> Produto
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-8">
        {categorias.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <UtensilsCrossed size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              Seu cardápio está vazio
            </h3>
            <p className="text-gray-500 mt-1">
              Comece criando a sua primeira categoria (ex: Pizzas, Bebidas).
            </p>
          </div>
        ) : (
          categorias.map((categoria) => {
            const produtosDaCategoria = produtos.filter(
              (p) => p.categoria_id === categoria.id,
            );

            return (
              <div
                key={categoria.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
              >
                {/* Header da Categoria */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Tag size={18} className="text-gray-500" />
                    <h2 className="font-bold text-gray-800 text-lg">
                      {categoria.nome}
                    </h2>
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium ml-2">
                      {produtosDaCategoria.length} itens
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setFormCategoria({
                          nome: categoria.nome,
                          ordem: categoria.ordem,
                        });
                        setModalCategoria({
                          aberto: true,
                          editando: categoria,
                        });
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => excluirCategoria(categoria.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {produtosDaCategoria.length === 0 ? (
                    <div className="p-4 text-sm text-gray-400 text-center italic">
                      Nenhum produto nesta categoria.
                    </div>
                  ) : (
                    produtosDaCategoria.map((produto) => (
                      <div
                        key={produto.id}
                        className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1 pr-4">
                          <p className="font-semibold text-gray-800">
                            {produto.nome}
                          </p>
                          {produto.descricao && (
                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                              {produto.descricao}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-green-600 whitespace-nowrap">
                            {formatarMoeda(produto.preco)}
                          </span>
                          <div className="flex gap-1 border-l border-gray-200 pl-4">
                            <button
                              onClick={() => {
                                setFormProduto({
                                  nome: produto.nome,
                                  descricao: produto.descricao || "",
                                  preco: produto.preco,
                                  categoria_id: produto.categoria_id,
                                });
                                setModalProduto({
                                  aberto: true,
                                  editando: produto,
                                });
                              }}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => excluirProduto(produto.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {modalCategoria.aberto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg">
                {modalCategoria.editando
                  ? "Editar Categoria"
                  : "Nova Categoria"}
              </h3>
              <button
                onClick={() =>
                  setModalCategoria({ aberto: false, editando: null })
                }
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={salvarCategoria} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={formCategoria.nome}
                  onChange={(e) =>
                    setFormCategoria({ ...formCategoria, nome: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="Ex: Pizzas Tradicionais"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordem de Exibição (Opcional)
                </label>
                <input
                  type="number"
                  value={formCategoria.ordem}
                  onChange={(e) =>
                    setFormCategoria({
                      ...formCategoria,
                      ordem: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={salvando}
                className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {salvando ? "Salvando..." : "Salvar Categoria"}
              </button>
            </form>
          </div>
        </div>
      )}

      {modalProduto.aberto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg">
                {modalProduto.editando ? "Editar Produto" : "Novo Produto"}
              </h3>
              <button
                onClick={() =>
                  setModalProduto({ aberto: false, editando: null })
                }
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={salvarProduto} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={formProduto.nome}
                  onChange={(e) =>
                    setFormProduto({ ...formProduto, nome: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="Ex: Pizza Margherita"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  required
                  value={formProduto.categoria_id}
                  onChange={(e) =>
                    setFormProduto({
                      ...formProduto,
                      categoria_id: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                >
                  <option value="" disabled>
                    Selecione uma categoria...
                  </option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição (Opcional)
                </label>
                <textarea
                  rows="2"
                  value={formProduto.descricao}
                  onChange={(e) =>
                    setFormProduto({
                      ...formProduto,
                      descricao: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
                  placeholder="Ingredientes ou detalhes do prato..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço (R$)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formProduto.preco}
                    onChange={(e) =>
                      setFormProduto({ ...formProduto, preco: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={salvando}
                className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 mt-2"
              >
                {salvando ? "Salvando..." : "Salvar Produto"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
