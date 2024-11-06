import { useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/api/axiosClient";
import { AuthContext } from "./authContextDefinition";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post("/user/login", { email, password });
      const recievedToken = response.data.token;
      setToken(recievedToken);
      localStorage.setItem("token", recievedToken);
      apiClient.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${recievedToken}`;
      navigate("/expenses");
    } catch (error) {
      throw new Error("Invalid email or password");
    }
  };
  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    delete apiClient.defaults.headers.common["Authorization"];
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{token, login, logout}}>
        {children};
    </AuthContext.Provider>
  )
};