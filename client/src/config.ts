const PRODUCTION_API_URL = 'https://skribbl-backend-4cg0.onrender.com';

export const BASE_URL = (import.meta.env.VITE_API_URL || PRODUCTION_API_URL).replace(/\/+$/, '');
