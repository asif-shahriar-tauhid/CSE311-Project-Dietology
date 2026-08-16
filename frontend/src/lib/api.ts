import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      try {
        const storeStr = localStorage.getItem('auth-storage');
        if (storeStr) {
          const { state } = JSON.parse(storeStr);
          if (state.token) {
            config.headers.Authorization = `Bearer ${state.token}`;
          }
        }
      } catch (error) {
        console.error('Failed to parse auth token from local storage', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const api = Object.assign(axiosInstance, {
  login: async (email: string, password: string) => {
    const res = await axiosInstance.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (data: any) => {
    const res = await axiosInstance.post('/auth/register', data);
    return res.data;
  },
  getMe: async () => {
    const res = await axiosInstance.get('/auth/me');
    return res.data;
  },
  deleteAccount: async () => {
    const res = await axiosInstance.delete('/auth/delete');
    return res.data;
  },

  // Biometrics
  getBiometrics: async () => {
    const res = await axiosInstance.get('/biometrics');
    return res.data;
  },
  addBiometric: async (data: any) => {
    const res = await axiosInstance.post('/biometrics', data);
    return res.data;
  },
  getSensitivityLevels: async () => {
    const res = await axiosInstance.get('/biometrics/sensitivity-levels');
    return res.data;
  },

  // Foods & Meals
  getFoods: async () => {
    const res = await axiosInstance.get('/foods');
    return res.data;
  },
  getCategories: async () => {
    const res = await axiosInstance.get('/foods/categories');
    return res.data;
  },
  getRegionalAvailability: async () => {
    const res = await axiosInstance.get('/foods/availability');
    return res.data;
  },
  getMeals: async () => {
    const res = await axiosInstance.get('/meals');
    return res.data;
  },
  addMeal: async (data: any) => {
    const res = await axiosInstance.post('/meals', data);
    return res.data;
  },
  deleteMeal: async (id: number) => {
    const res = await axiosInstance.delete(`/meals/${id}`);
    return res.data;
  },

  // Workouts
  getWorkouts: async () => {
    const res = await axiosInstance.get('/workouts');
    return res.data;
  },
  addWorkout: async (data: any) => {
    const res = await axiosInstance.post('/workouts', data);
    return res.data;
  },
  getExercises: async () => {
    const res = await axiosInstance.get('/workouts/exercises');
    return res.data;
  },

  // Sleep
  getSleepLogs: async () => {
    const res = await axiosInstance.get('/sleep');
    return res.data;
  },
  addSleepLog: async (data: any) => {
    const res = await axiosInstance.post('/sleep', data);
    return res.data;
  },

  // Environment
  getRegions: async () => {
    const res = await axiosInstance.get('/environment/regions');
    return res.data;
  },
  getEnvironments: async () => {
    const res = await axiosInstance.get('/environment');
    return res.data;
  }
});

export default axiosInstance;
