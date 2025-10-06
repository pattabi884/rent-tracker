import axios from "axios";

// ✅ Backend base URL
const API_URL = "http://localhost:3000/api";

// ------------------- AUTH -------------------
// Login
export const login = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    return res.data;
  } catch (err) {
    console.error("Login error:", err.response?.data || err.message);
    throw err;
  }
};

// Register (if needed)
export const register = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/auth/register`, { email, password });
    return res.data;
  } catch (err) {
    console.error("Register error:", err.response?.data || err.message);
    throw err;
  }
};

// ------------------- RENTS -------------------
// Get all rents (protected)
export const getRents = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/rents`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching rents:", err.response?.data || err.message);
    throw err;
  }
};

// Get rent summary (protected)
export const getRentSummary = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/rents/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching rent summary:", err.response?.data || err.message);
    throw err;
  }
};

// ------------------- INCOMES -------------------
// Get all incomes (protected)
export const getIncomes = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/incomes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching incomes:", err.response?.data || err.message);
    throw err;
  }
};
