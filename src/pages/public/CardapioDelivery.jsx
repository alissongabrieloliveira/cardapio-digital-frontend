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
  MapPin,
  User,
  Phone,
  CreditCard,
  Store,
} from "lucide-react";

export function CardapioDelivery() {
  const { slug } = useParams();

  const [estabelecimento, setEstabelecimento] = useState(null);
  const [menu, setMenu] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [carrinho, setCarrinho] = useState([]);
  const [modalProduto, setModalProduto] = useState(null);
  const [modalCheckout, setModalCheckout] = useState(false);
  const [enviandoPedido, setEnviandoPedido] = useState(false);
  const [pedidoSucesso, setPedidoSucesso] = useState(false);

  const [quantidade, setQuantidade] = useState(1);
  const [observacaoItem, setObservacaoItem] = useState("");
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState([]);

  const [tipoPedido, setTipoPedido] = useState("delivery");
  const [formaPagamento, setFormaPagamento] = useState("pix");
  const [observacoesGerais, setObservacoesGerais] = useState("");
  const [cliente, setCliente] = useState({ nome: "", telefone: "" });
  const [endereco, setEndereco] = useState({
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    referencia: "",
  });

  useEffect(() => {
    async function carregarCardapio() {
      try {
        const resposta = await api.get(`/publico/delivery/${slug}/cardapio`);
        setEstabelecimento(resposta.data.estabelecimento);
        setMenu(resposta.data.menu);
      } catch (error) {
        setErro(
          error.response?.data?.erro || "Estabelecimento não encontrado.",
        );
      } finally {
        setCarregando(false);
      }
    }
    carregarCardapio();
  }, [slug]);

  const formatarMoeda = (valor) =>
    Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  function abrirModalProduto(produto) {
    setModalProduto(produto);
    setQuantidade(1);
    setObservacaoItem("");
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
      observacao: observacaoItem,
      adicionais: adicionaisSelecionados,
    };
    setCarrinho((prev) => [...prev, novoItem]);
    setModalProduto(null);
  }

  function removerDoCarrinho(cart_id) {
    setCarrinho((prev) => prev.filter((item) => item.cart_id !== cart_id));
    if (carrinho.length === 1) setModalCheckout(false);
  }

  const subtotalCarrinho = carrinho.reduce((acc, item) => {
    const custoAdicionais = item.adicionais.reduce(
      (soma, adc) => soma + Number(adc.preco),
      0,
    );
    return acc + (item.preco_base + custoAdicionais) * item.quantidade;
  }, 0);

  const taxaDelivery =
    tipoPedido === "delivery"
      ? Number(estabelecimento?.taxa_delivery_fixa || 0)
      : 0;
  const totalPedido = subtotalCarrinho + taxaDelivery;

  async function enviarPedido(e) {
    e.preventDefault();
    setEnviandoPedido(true);

    try {
      const payload = {
        tipo: tipoPedido,
        forma_pagamento: formaPagamento,
        cliente,
        endereco: tipoPedido === "delivery" ? endereco : null,
        observacoes: observacoesGerais,
        itens: carrinho.map((item) => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          observacao: item.observacao,
          adicionais_ids: item.adicionais.map((a) => a.id),
        })),
      };

      await api.post(`/publico/delivery/${slug}/pedidos`, payload);

      setCarrinho([]);
      setModalCheckout(false);
      setPedidoSucesso(true);
      window.scrollTo(0, 0);
      setTimeout(() => setPedidoSucesso(false), 8000);
    } catch (error) {
      alert(error.response?.data?.erro || "Erro ao processar o seu pedido.");
    } finally {
      setEnviandoPedido(false);
    }
  }

  if (carregando)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-red-600">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );

  if (erro) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <Store size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Ops!</h2>
        <p className="text-gray-500">{erro}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 font-sans">
      <div className="bg-white shadow-sm pb-4 rounded-b-3xl relative">
        {/* Banner */}
        <div className="h-32 w-full bg-gray-200 object-cover rounded-b-3xl overflow-hidden">
          {estabelecimento?.banner_url ? (
            <img
              src={estabelecimento.banner_url}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-red-500 to-red-700" />
          )}
        </div>

        <div className="px-6 flex flex-col items-center -mt-10 relative z-10 text-center">
          <div className="w-20 h-20 bg-white rounded-full p-1 shadow-md mb-2">
            {estabelecimento?.logo_url ? (
              <img
                src={estabelecimento.logo_url}
                alt="Logo"
                className="w-full h-full rounded-full object-cover border border-gray-100"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <Store size={32} />
              </div>
            )}
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            {estabelecimento?.nome}
          </h1>
          {estabelecimento?.slogan && (
            <p className="text-gray-500 text-sm mt-1">
              {estabelecimento.slogan}
            </p>
          )}
          <div className="mt-3 inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />{" "}
            Aberto para Pedidos
          </div>
        </div>
      </div>

      {pedidoSucesso && (
        <div className="mx-4 mt-6 bg-green-100 border border-green-200 p-5 rounded-2xl flex flex-col items-center text-center shadow-sm">
          <CheckCircle2 className="text-green-600 w-12 h-12 mb-2" />
          <h3 className="text-green-800 font-bold text-lg">Pedido Recebido!</h3>
          <p className="text-green-700 text-sm mt-1">
            A cozinha já está a preparar o seu pedido. Acompanhe a entrega pelo
            telemóvel fornecido.
          </p>
        </div>
      )}

      <div className="p-4 mt-2 space-y-8 max-w-2xl mx-auto">
        {menu.map((categoria) => {
          if (categoria.produtos.length === 0) return null;
          return (
            <div key={categoria.id}>
              <h2 className="text-xl font-bold text-gray-800 mb-4 px-2 border-l-4 border-red-500">
                {categoria.nome}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categoria.produtos.map((produto) => (
                  <div
                    key={produto.id}
                    onClick={() => abrirModalProduto(produto)}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between gap-4 active:scale-95 transition-transform cursor-pointer hover:shadow-md"
                  >
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 leading-tight">
                          {produto.nome}
                        </h3>
                        {produto.descricao && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {produto.descricao}
                          </p>
                        )}
                      </div>
                      <p className="text-red-600 font-black mt-3">
                        {formatarMoeda(produto.preco)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {carrinho.length > 0 && !modalCheckout && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-100 pt-10 pointer-events-none z-40">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setModalCheckout(true)}
              className="w-full bg-red-600 text-white rounded-2xl p-4 flex justify-between items-center shadow-2xl pointer-events-auto active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-800/50 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                  {carrinho.reduce((acc, item) => acc + item.quantidade, 0)}
                </div>
                <span className="font-semibold text-lg">Ver Carrinho</span>
              </div>
              <span className="font-black text-lg">
                {formatarMoeda(subtotalCarrinho)}
              </span>
            </button>
          </div>
        </div>
      )}

      {modalProduto && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl mx-auto rounded-t-3xl max-h-[90vh] flex flex-col animate-slide-up relative">
            <button
              onClick={() => setModalProduto(null)}
              className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full text-gray-600 z-10"
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
                    <span>Opcionais</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
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
                          className={`flex justify-between items-center p-3 rounded-xl border-2 cursor-pointer ${selecionado ? "border-red-500 bg-red-50" : "border-gray-100 bg-white"}`}
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
                <h4 className="font-bold text-gray-800 mb-2">Observação</h4>
                <textarea
                  rows="2"
                  value={observacaoItem}
                  onChange={(e) => setObservacaoItem(e.target.value)}
                  placeholder="Ex: Sem cebola..."
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

      {modalCheckout && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-50 w-full max-w-2xl mx-auto rounded-t-3xl h-[90vh] flex flex-col animate-slide-up">
            <div className="p-4 border-b border-gray-200 bg-white rounded-t-3xl flex justify-between items-center shrink-0">
              <h2 className="font-black text-xl text-gray-800">
                Finalizar Pedido
              </h2>
              <button
                onClick={() => setModalCheckout(false)}
                className="p-2 bg-gray-100 rounded-full text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={enviarPedido}
              className="overflow-y-auto flex-1 p-4 space-y-6"
            >
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <ShoppingBag size={18} /> O Seu Pedido
                </h3>
                <div className="space-y-3 mb-3">
                  {carrinho.map((item) => (
                    <div
                      key={item.cart_id}
                      className="flex justify-between text-sm border-b border-gray-50 pb-2"
                    >
                      <div className="flex-1">
                        <span className="font-bold text-gray-900">
                          {item.quantidade}x
                        </span>{" "}
                        <span className="text-gray-700">
                          {item.nome_produto}
                        </span>
                        {item.adicionais.map((adc) => (
                          <p
                            key={adc.id}
                            className="text-xs text-gray-500 ml-4"
                          >
                            + {adc.nome}
                          </p>
                        ))}
                      </div>
                      <span className="font-medium text-gray-800">
                        {formatarMoeda(
                          (item.preco_base +
                            item.adicionais.reduce(
                              (acc, a) => acc + Number(a.preco),
                              0,
                            )) *
                            item.quantidade,
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3">
                  Como deseja receber?
                </h3>
                <div className="flex gap-3">
                  <label className="flex-1 relative">
                    <input
                      type="radio"
                      name="tipo"
                      checked={tipoPedido === "delivery"}
                      onChange={() => setTipoPedido("delivery")}
                      className="peer sr-only"
                    />
                    <div className="p-3 border-2 rounded-xl cursor-pointer text-center peer-checked:border-red-500 peer-checked:bg-red-50 text-gray-600 peer-checked:text-red-700 transition-all font-medium flex flex-col items-center gap-1">
                      <MapPin size={20} /> Delivery
                    </div>
                  </label>
                  <label className="flex-1 relative">
                    <input
                      type="radio"
                      name="tipo"
                      checked={tipoPedido === "retirada"}
                      onChange={() => setTipoPedido("retirada")}
                      className="peer sr-only"
                    />
                    <div className="p-3 border-2 rounded-xl cursor-pointer text-center peer-checked:border-red-500 peer-checked:bg-red-50 text-gray-600 peer-checked:text-red-700 transition-all font-medium flex flex-col items-center gap-1">
                      <Store size={20} /> Retirar no Local
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <User size={18} /> Seus Dados
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Seu Nome Completo"
                    value={cliente.nome}
                    onChange={(e) =>
                      setCliente({ ...cliente, nome: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Seu Telefone / WhatsApp"
                    value={cliente.telefone}
                    onChange={(e) =>
                      setCliente({ ...cliente, telefone: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {tipoPedido === "delivery" && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-slide-up">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <MapPin size={18} /> Endereço de Entrega
                  </h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Rua / Avenida"
                        value={endereco.rua}
                        onChange={(e) =>
                          setEndereco({ ...endereco, rua: e.target.value })
                        }
                        className="w-2/3 bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Número"
                        value={endereco.numero}
                        onChange={(e) =>
                          setEndereco({ ...endereco, numero: e.target.value })
                        }
                        className="w-1/3 bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Bairro"
                      value={endereco.bairro}
                      onChange={(e) =>
                        setEndereco({ ...endereco, bairro: e.target.value })
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <input
                      type="text"
                      placeholder="Ponto de Referência (Opcional)"
                      value={endereco.referencia}
                      onChange={(e) =>
                        setEndereco({ ...endereco, referencia: e.target.value })
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <CreditCard size={18} /> Pagamento na Entrega
                </h3>
                <select
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-500 font-medium text-gray-700"
                >
                  <option value="pix">Pagar com PIX</option>
                  <option value="dinheiro">Dinheiro (Levar troco)</option>
                  <option value="credito">Cartão de Crédito</option>
                  <option value="debito">Cartão de Débito</option>
                </select>
              </div>

              <div className="bg-gray-100 p-4 rounded-2xl space-y-2 mb-8 border border-gray-200">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span>{formatarMoeda(subtotalCarrinho)}</span>
                </div>
                {tipoPedido === "delivery" && (
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Taxa de Entrega</span>
                    <span>{formatarMoeda(taxaDelivery)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-900 font-black text-lg pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-green-600">
                    {formatarMoeda(totalPedido)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={enviandoPedido}
                className="w-full bg-green-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-green-600/30 active:scale-95 transition-transform flex justify-center items-center gap-2 disabled:opacity-70 mt-8 mb-4"
              >
                {enviandoPedido ? (
                  <>
                    <Loader2 className="animate-spin w-6 h-6" /> Processando...
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-6 h-6" /> Enviar Pedido (
                    {formatarMoeda(totalPedido)})
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
      <style>{`@keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1); }`}</style>
    </div>
  );
}
