import api from "./client";
import type { NavigateFunction } from "react-router-dom";

export const login = async (email: string, password: string) => {
  const response = await api.post("/login", { email, password });
  localStorage.setItem("token", response.data.token);
  localStorage.setItem("user", JSON.stringify(response.data.user));
  return response.data.user;
};

export const logout = (navigate?: NavigateFunction) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

    if (navigate) {
        navigate("/login", { replace: true });
    } else {
        // fallback
        window.location.href = "/login";
    }
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const isLoggedIn = () => !!localStorage.getItem("token");
