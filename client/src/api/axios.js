import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` : '/api';

const api = axios.create({
    baseURL: apiUrl,
});

export default api;
