import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // ← adjust if your backend runs on different port/host
  timeout: 10000, // optional: prevent hanging requests
});

// Request interceptor – dynamically choose the right token based on current URL path
api.interceptors.request.use(
  (config) => {
    let token = null;

    const pathname = window.location.pathname;

    // Vet section → use vet_token
    if (pathname.startsWith('/vet')) {
      token = localStorage.getItem('vet_token');
    }
    // Owner section → use owner_token
    else if (pathname.startsWith('/owner')) {
      token = localStorage.getItem('owner_token');
    }
    // Fallback (useful during development or if user refreshes on dashboard)
    else {
      // Try vet first, then owner (or reverse based on your preference)
      token = localStorage.getItem('vet_token') || localStorage.getItem('owner_token');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Response interceptor to handle 401 globally (logout / redirect)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalid/expired → clear relevant storage
      const pathname = window.location.pathname;

      if (pathname.startsWith('/vet')) {
        localStorage.removeItem('vet_token');
        localStorage.removeItem('vet_user');
        localStorage.removeItem('vet');
      } else if (pathname.startsWith('/owner')) {
        localStorage.removeItem('owner_token');
        localStorage.removeItem('owner_user');
        localStorage.removeItem('owner');
      }

      // Optional: redirect to login
      // window.location.href = pathname.startsWith('/vet') ? '/vet/login' : '/owner/login';
    }

    return Promise.reject(error);
  }
);

export default api;