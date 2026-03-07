import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../services/api";
import {
  ShoppingBag,
  Plus,
  Minus,
  X,
  UtensilsCrossed,
  ChevronRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export function CardapioMesa() {
  const { token } = useParams();

  const [estabelecimento, setEstabelecimento] = useState(null);
  const [numeroMesa, setNumeroMesa] = useState("");
  const [menu, setMenu] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroAtendimento, setErroAtendimento] = useState("");

  const [carrinho, setCarrinho] = useState([]);
  const [modalProduto, setModalProduto] = useState(null);
  const [modalCarrinhoAberto, setModalCarrinhoAberto] = useState(false);
  const [enviandoPedido, setEnviandoPedido] = useState(false);
  const [pedidoSucesso, setPedidoSucesso] = useState(false);

  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState("");
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState([]);

  const headersSeguranca = { "x-mesa-token": token };

  useEffect(() => {
    async function carregarCardapio() {
      try {
        const resposta = await api.get("/publico/mesa/cardapio", {
          headers: headersSeguranca,
        });
        setEstabelecimento(resposta.data.estabelecimento);
        setNumeroMesa(resposta.data.mesa);
        setMenu(resposta.data.menu);
      } catch (error) {
        setErroAtendimento(
          error.response?.data?.erro || "Sessão expirada ou QR Code inválido.",
        );
      } finally {
        setCarregando(false);
      }
    }
    carregarCardapio();
  }, [token]);

  const formatarMoeda = (valor) =>
    Number(valor).toLocaleString("pt-PT", {
      style: "currency",
      currency: "EUR",
    });

  function abrirModalProduto(produto) {
    setModalProduto(produto);
    setQuantidade(1);
    setObservacao("");
    setAdicionaisSelecionados([]);
  }

  function toggleAdicional(adicional) {
    const jaSelecionado = adicionaisSelecionados.find(
      (a) => a.id === adicional.id,
    );
    if (jaSelecionado) {
      setAdicionaisSelecionados((prev) =>
        prev.filter((a) => a.id !== adicional.id),
      );
    } else {
      setAdicionaisSelecionados((prev) => [...prev, adicional]);
    }
  }

  function adicionarAoCarrinho() {
    const novoItem = {
      cart_id: Date.now().toString(),
      produto_id: modalProduto.id,
      nome_produto: modalProduto.nome,
      preco_base: Number(modalProduto.preco),
      quantidade,
      observacao,
      adicionais: adicionaisSelecionados,
    };

    setCarrinho((prev) => [...prev, novoItem]);
    setModalProduto(null);
  }

  function removerDoCarrinho(cart_id) {
    setCarrinho((prev) => prev.filter((item) => item.cart_id !== cart_id));
    if (carrinho.length === 1) setModalCarrinhoAberto(false);
  }

  const totalItensCarrinho = carrinho.reduce(
    (acc, item) => acc + item.quantidade,
    0,
  );
  const valorTotalCarrinho = carrinho.reduce((acc, item) => {
    const custoAdicionais = item.adicionais.reduce(
      (soma, adc) => soma + Number(adc.preco),
      0,
    );
    return acc + (item.preco_base + custoAdicionais) * item.quantidade;
  }, 0);

  async function finalizarPedido() {
    setEnviandoPedido(true);
    try {
      const payload = {
        observacoes: "Pedido feito via Autoatendimento",
        itens: carrinho.map((item) => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          observacao: item.observacao,
          adicionais_ids: item.adicionais.map((a) => a.id),
        })),
      };

      await api.post("/publico/mesa/pedidos", payload, {
        headers: headersSeguranca,
      });

      setCarrinho([]);
      setModalCarrinhoAberto(false);
      setPedidoSucesso(true);

      setTimeout(() => setPedidoSucesso(false), 5000);
    } catch (error) {
      alert(error.response?.data?.erro || "Erro ao enviar pedido.");
    } finally {
      setEnviandoPedido(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-red-600">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );
  }

  if (erroAtendimento) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <UtensilsCrossed size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h2>
        <p className="text-gray-500">{erroAtendimento}</p>
        <p className="text-sm text-gray-400 mt-4">
          Por favor, solicite ao garçom para abrir a sua mesa e gerar um novo QR
          Code.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <div className="bg-red-600 text-white p-6 rounded-b-[2rem] shadow-md relative">
        <h1 className="text-2xl font-black">{estabelecimento?.nome}</h1>
        <p className="text-red-100 mt-1">
          {estabelecimento?.slogan || "Bem-vindo ao nosso menu digital"}
        </p>
        <div className="absolute -bottom-4 right-6 bg-white text-gray-800 px-4 py-1.5 rounded-full font-bold shadow-lg text-sm border border-gray-100">
          Mesa {numeroMesa}
        </div>
      </div>

      {pedidoSucesso && (
        <div className="mx-4 mt-6 bg-green-100 border-l-4 border-green-500 p-4 rounded-lg flex items-center gap-3 shadow-sm animate-bounce">
          <CheckCircle2 className="text-green-600 w-6 h-6" />
          <p className="text-green-800 font-medium text-sm">
            O seu pedido foi enviado para a cozinha com sucesso!
          </p>
        </div>
      )}

      <div className="p-4 mt-4 space-y-8">
        {menu.map((categoria) => {
          if (categoria.produtos.length === 0) return null;

          return (
            <div key={categoria.id}>
              <h2 className="text-xl font-bold text-gray-800 mb-4 px-2 border-l-4 border-red-500">
                {categoria.nome}
              </h2>
              <div className="space-y-4">
                {categoria.produtos.map((produto) => (
                  <div
                    key={produto.id}
                    onClick={() => abrirModalProduto(produto)}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between gap-4 active:scale-95 transition-transform cursor-pointer"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 leading-tight">
                        {produto.nome}
                      </h3>
                      {produto.descricao && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {produto.descricao}
                        </p>
                      )}
                      <p className="text-red-600 font-black mt-2">
                        {formatarMoeda(produto.preco)}
                      </p>
                    </div>

                    <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                      <UtensilsCrossed className="text-gray-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {carrinho.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 pt-10 pointer-events-none">
          <button
            onClick={() => setModalCarrinhoAberto(true)}
            className="w-full bg-red-600 text-white rounded-2xl p-4 flex justify-between items-center shadow-2xl pointer-events-auto active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="bg-red-800/50 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                {totalItensCarrinho}
              </div>
              <span className="font-semibold text-lg">Ver Carrinho</span>
            </div>
            <span className="font-black text-lg">
              {formatarMoeda(valorTotalCarrinho)}
            </span>
          </button>
        </div>
      )}

      {modalProduto && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full rounded-t-3xl max-h-[90vh] flex flex-col animate-slide-up relative">
            <button
              onClick={() => setModalProduto(null)}
              className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="p-6 pb-4 border-b border-gray-100">
              <h3 className="text-2xl font-black text-gray-900 pr-8">
                {modalProduto.nome}
              </h3>
              {modalProduto.descricao && (
                <p className="text-gray-500 text-sm mt-2">
                  {modalProduto.descricao}
                </p>
              )}
              <p className="text-red-600 font-black text-xl mt-3">
                {formatarMoeda(modalProduto.preco)}
              </p>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {modalProduto.adicionais?.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 flex justify-between items-end">
                    <span>Turbine o seu pedido</span>
                    <span className="text-xs font-normal bg-gray-100 text-gray-500 px-2 py-1 rounded">
                      Opcional
                    </span>
                  </h4>
                  <div className="space-y-3">
                    {modalProduto.adicionais.map((adc) => {
                      const selecionado = adicionaisSelecionados.some(
                        (a) => a.id === adc.id,
                      );
                      return (
                        <label
                          key={adc.id}
                          className={`flex justify-between items-center p-3 rounded-xl border-2 transition-colors cursor-pointer ${selecionado ? "border-red-500 bg-red-50" : "border-gray-100 bg-white"}`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selecionado}
                              onChange={() => toggleAdicional(adc)}
                              className="w-5 h-5 accent-red-600"
                            />
                            <span
                              className={`font-medium ${selecionado ? "text-red-800" : "text-gray-700"}`}
                            >
                              {adc.nome}
                            </span>
                          </div>
                          <span className="font-bold text-gray-500">
                            + {formatarMoeda(adc.preco)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-bold text-gray-800 mb-2">
                  Alguma observação?
                </h4>
                <textarea
                  rows="2"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Ex: Tirar cebola, ponto da carne..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-2 rounded-2xl border border-gray-100">
                <button
                  onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                  className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-600 disabled:opacity-50"
                  disabled={quantidade === 1}
                >
                  <Minus size={20} />
                </button>
                <span className="text-2xl font-black text-gray-800 w-12 text-center">
                  {quantidade}
                </span>
                <button
                  onClick={() => setQuantidade((q) => q + 1)}
                  className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-600"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 pb-8">
              <button
                onClick={adicionarAoCarrinho}
                className="w-full bg-red-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-transform flex justify-between px-6"
              >
                <span>Adicionar</span>
                <span>
                  {formatarMoeda(
                    (Number(modalProduto.preco) +
                      adicionaisSelecionados.reduce(
                        (acc, a) => acc + Number(a.preco),
                        0,
                      )) *
                      quantidade,
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {modalCarrinhoAberto && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-50 w-full rounded-t-3xl max-h-[90vh] flex flex-col animate-slide-up">
            <div className="p-4 border-b border-gray-200 bg-white rounded-t-3xl flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                <ShoppingBag size={20} /> O seu Pedido
              </div>
              <button
                onClick={() => setModalCarrinhoAberto(false)}
                className="p-2 bg-gray-100 rounded-full text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {carrinho.map((item) => (
                <div
                  key={item.cart_id}
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-3"
                >
                  <div className="bg-gray-100 text-gray-600 font-black px-3 py-1 rounded-lg h-fit text-sm">
                    {item.quantidade}x
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-800 leading-tight">
                        {item.nome_produto}
                      </h4>
                      <button
                        onClick={() => removerDoCarrinho(item.cart_id)}
                        className="text-red-500 text-sm font-semibold underline"
                      >
                        Remover
                      </button>
                    </div>
                    {item.adicionais.map((adc) => (
                      <p key={adc.id} className="text-xs text-gray-500 mt-1">
                        + {adc.nome}{" "}
                        <span className="text-gray-400">
                          ({formatarMoeda(adc.preco)})
                        </span>
                      </p>
                    ))}
                    {item.observacao && (
                      <p className="text-xs bg-red-50 text-red-700 p-1.5 rounded mt-2 border border-red-100 font-medium italic">
                        Obs: {item.observacao}
                      </p>
                    )}
                    <p className="text-right text-green-600 font-black mt-2">
                      {formatarMoeda(
                        (item.preco_base +
                          item.adicionais.reduce(
                            (acc, a) => acc + Number(a.preco),
                            0,
                          )) *
                          item.quantidade,
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-gray-200 pb-8 space-y-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-600 font-medium">Total</span>
                <span className="text-2xl font-black text-gray-900">
                  {formatarMoeda(valorTotalCarrinho)}
                </span>
              </div>
              <button
                onClick={finalizarPedido}
                disabled={enviandoPedido}
                className="w-full bg-green-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-green-600/30 active:scale-95 transition-transform flex justify-center items-center gap-2 disabled:opacity-70 disabled:active:scale-100"
              >
                {enviandoPedido ? (
                  <>
                    <Loader2 className="animate-spin w-6 h-6" /> Enviando...
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-6 h-6" /> Confirmar Pedido
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
