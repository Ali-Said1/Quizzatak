import api from './api.js';

const authService = {
  // Register a new user
  async registerUser({ username, email, password, role }) {
    try {
      const { data } = await api.post('/auth/register', {
        username,
        email,
        password,
        role
      });
      
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      return data; // { user, token }
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  },

  // Login user
  async loginUser(email, password) {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      return data; // { user, token }
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  },

  // Logout current user
  async logoutUser() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
    }
  },

  // Get current logged-in user
  async getCurrentUser() {
    try {
      // const { data } = await api.get('/auth/me');
      const user ={
        id: "uuid",
        username: "teacher1",
        email: "teacher@gmail.com",
        password: "hashedpassword",
        role: "teacher", // or "student",
        classrooms: ["classroom1", "classroom2"],
        quizSubmissions: ["submission1", "submission2"],
        createdAt: "2025-09-28T02:49:09Z"
      }

      return user;
    } catch (error) {
      throw new Error(error.message || 'Failed to get user');
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Get stored token
  getToken() {
    return localStorage.getItem('token');
  },

  // Update user profile
  async updateUserProfile(updates) {
    try {
      const { data } = await api.patch('/auth/profile', updates);
      return data.user;
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile');
    }
  },

  // Change user password
  async changeUserPassword(currentPassword, newPassword) {
    try {
      const { data } = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to change password');
    }
  }
};

export default authService;
