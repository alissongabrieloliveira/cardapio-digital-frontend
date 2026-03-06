import { createContext, useState, useEffect, useContext } from "react";
import { api } from "../services/api";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usuario = localStorage.getItem("@SaasMenu:usuario");
    const token = localStorage.getItem("@SaasMenu:token");
    const refreshToken = localStorage.getItem("@SaasMenu:refreshToken");

    if (usuario && token) {
      api.defaults.headers.authorization = `Bearer ${token}`;

      setData({
        usuario: JSON.parse(usuario),
        token,
        refreshToken,
      });
    }

    setLoading(false);
  }, []);

  async function signIn({ email, senha }) {
    try {
      const response = await api.post("/auth/login", { email, senha });
      const { usuario, tokens } = response.data;

      localStorage.setItem("@SaasMenu:usuario", JSON.stringify(usuario));
      localStorage.setItem("@SaasMenu:token", tokens.accessToken);
      localStorage.setItem("@SaasMenu:refreshToken", tokens.refreshToken);

      api.defaults.headers.authorization = `Bearer ${tokens.accessToken}`;

      setData({
        usuario,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      return { sucesso: true };
    } catch (error) {
      const mensagemErro =
        error.response?.data?.erro || "Erro ao conectar com o servidor.";
      return { sucesso: false, erro: mensagemErro };
    }
  }

  function signOut() {
    localStorage.removeItem("@SaasMenu:usuario");
    localStorage.removeItem("@SaasMenu:token");
    localStorage.removeItem("@SaasMenu:refreshToken");

    delete api.defaults.headers.authorization;

    setData({});
  }

  return (
    <AuthContext.Provider
      value={{ signIn, signOut, usuario: data.usuario, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
