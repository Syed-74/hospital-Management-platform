import axios from "axios";


// http://localhost:5000/api
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
    headers: {
    },
    withCredentials: true,
});

// Request Interceptor: Attach Token
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global Errors (like 401)
instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't already retried
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            // Prevent infinite loops if the refresh token endpoint itself returns 401
            if (originalRequest.url === '/auth/refresh-token') {
                return Promise.reject(error);
            }
            
            originalRequest._retry = true;
            
            try {
                // Attempt to refresh token using httpOnly cookie
                const response = await instance.get('/auth/refresh-token');
                
                if (response.data.status === "success") {
                    const newAccessToken = response.data.data.accessToken;
                    
                    // Update local storage and axios headers
                    localStorage.setItem('token', newAccessToken);
                    instance.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    
                    // Retry the original request with the new token
                    return instance(originalRequest);
                }
            } catch (refreshError) {
                console.error("Session expired. Please log in again.");
                // Clear token and force logout on frontend
                localStorage.removeItem('token');
                delete instance.defaults.headers.common["Authorization"];
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default instance;