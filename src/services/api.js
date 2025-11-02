//By creating this api axios wrapper we make sure we don't have to repeat error handling or attaching tokens.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  timeout: 10000,
});


//The axios interceptor checks if there is a token and attaches it to the request before it is sent, if there is no token then 
//the request is sent without an authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


//This interceptor checks for errors after a response is received, if there is then the token is removed from local storage,
//and the user is redirected to the login page (user not authorized) 
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && 
        !err.config.url.includes('/auth/')) {
      localStorage.removeItem('token');
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Usage example:
// Get a quiz from the quizzes endpoint
// const response = await api.get(`/quizzes/${quizId}`);
// const quiz = response.data;