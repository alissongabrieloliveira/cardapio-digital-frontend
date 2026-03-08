import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Mail, Lock, Loader2, UtensilsCrossed, ArrowRight } from "lucide-react";
import LoginImage from "../../assets/login-illustration.svg";

export function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setErro("");

    if (!email || !senha) {
      return setErro("Por favor, preencha todos os campos para continuar.");
    }

    setCarregando(true);

    const resposta = await signIn({ email, senha });

    if (resposta.sucesso) {
      navigate("/admin/dashboard");
    } else {
      setErro(resposta.erro);
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-[480px] xl:w-[560px] relative z-10 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.1)]">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center gap-2 mb-10">
            <div className="bg-red-600 p-2 rounded-xl text-white shadow-lg shadow-red-600/30">
              <UtensilsCrossed size={28} />
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              Click Menu
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Bem-vindo!
            </h2>
            <p className="mt-2 text-sm text-gray-500 font-medium">
              Acesse seu painel para gerir o seu restaurante e alavancar as suas
              vendas.
            </p>
          </div>

          <div className="mt-8">
            {erro && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-pulse">
                <div className="text-red-600 mt-0.5">
                  <Lock size={16} />
                </div>
                <p className="text-sm font-medium text-red-800">{erro}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  className="block text-sm font-bold text-gray-700 mb-1"
                  htmlFor="email"
                >
                  E-mail
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@restaurante.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all sm:text-sm bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    className="block text-sm font-bold text-gray-700"
                    htmlFor="senha"
                  >
                    Senha
                  </label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Em breve: Recuperação de senha por email!");
                    }}
                    className="text-sm font-semibold text-red-600 hover:text-red-500 transition-colors"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="senha"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="block w-full pl-11 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all sm:text-sm bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-red-600/30 text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  {carregando ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 text-white" />A
                      autenticar...
                    </>
                  ) : (
                    <>
                      Entrar no Painel
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative bg-red-50 items-center justify-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-red-200 mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-12 -left-12 w-72 h-72 rounded-full bg-orange-200 mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center max-w-lg text-center px-8">
          <img
            src={LoginImage}
            alt="Ilustração Chef"
            className="w-full h-auto max-w-[400px] mb-8 drop-shadow-2xl"
          />

          <h3 className="text-3xl font-black text-gray-900 mb-4">
            A gestão perfeita para a sua cozinha.
          </h3>
          <p className="text-lg text-gray-600 font-medium">
            Acompanhe pedidos, organize as suas mesas e veja o seu faturamento
            crescer em tempo real, num só lugar.
          </p>
        </div>
      </div>
    </div>
  );
}
