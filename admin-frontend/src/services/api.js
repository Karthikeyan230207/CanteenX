import axios from "axios";

const api = axios.create({
  baseURL: "https://smart-canteen-system-pyyl.onrender.com/api",
});

// Automatically attach JWT to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;