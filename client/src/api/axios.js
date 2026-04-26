import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://capstone-3hbm.onrender.com", // Dynamic Server URL
});

export default api;
