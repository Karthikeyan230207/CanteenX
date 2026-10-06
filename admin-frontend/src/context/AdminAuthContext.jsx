import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    const token = localStorage.getItem("adminToken");

    if (storedAdmin && token) {
      setAdmin(JSON.parse(storedAdmin));
    }

    setLoading(false);
  }, []);

  const completeLogin = (token, admin) => {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("admin", JSON.stringify(admin));
    setAdmin(admin);
  };

  const login = async (email, password) => {
    const response = await api.post("/admin/login", {
      email,
      password,
    });

    const { token, admin } = response.data;

    completeLogin(token, admin);

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");

    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        login,
        completeLogin,
        logout,
        isAuthenticated: !!admin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  return useContext(AdminAuthContext);
};