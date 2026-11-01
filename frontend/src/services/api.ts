import axios from 'axios';
import {
  AuthResponse,
  User,
  EventItem,
  BudgetOverview,
  BudgetItem,
  ExpenseItem,
  TaskItem,
  VendorItem,
  FullEventPlan,
  ChatMessage
} from '../types';

// Dynamic API Base URL:
// If VITE_API_URL is specified, use it.
// If running in production (e.g. on Cloud Run, port is not 5173), use relative '/api/v1'.
// If local vite dev server (port 5173), use 'http://localhost:8000/api/v1'.
const isViteDev = typeof window !== 'undefined' && window.location.port === '5173';
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || (isViteDev ? 'http://localhost:8000/api/v1' : '/api/v1');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('eventease_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle 401s
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  register: async (payload: { name: string; email: string; password: string; currency?: string }): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/register', payload);
    return res.data;
  },
  login: async (payload: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/login', payload);
    return res.data;
  },
  demoLogin: async (): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/demo');
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  updateMe: async (payload: { name?: string; currency?: string }): Promise<User> => {
    const res = await apiClient.put('/auth/me', payload);
    return res.data;
  },

  // Events
  getEvents: async (status?: string): Promise<EventItem[]> => {
    const params = status ? { status } : {};
    const res = await apiClient.get('/events/', { params });
    return res.data;
  },
  getEvent: async (id: number): Promise<EventItem> => {
    const res = await apiClient.get(`/events/${id}`);
    return res.data;
  },
  createEvent: async (payload: Partial<EventItem>): Promise<EventItem> => {
    const res = await apiClient.post('/events/', payload);
    return res.data;
  },
  updateEvent: async (id: number, payload: Partial<EventItem>): Promise<EventItem> => {
    const res = await apiClient.put(`/events/${id}`, payload);
    return res.data;
  },
  deleteEvent: async (id: number): Promise<void> => {
    await apiClient.delete(`/events/${id}`);
  },

  // Budgets
  getBudgetOverview: async (eventId: number): Promise<BudgetOverview> => {
    const res = await apiClient.get(`/budgets/${eventId}`);
    return res.data;
  },
  addBudgetCategory: async (eventId: number, payload: Partial<BudgetItem>): Promise<BudgetItem> => {
    const res = await apiClient.post(`/budgets/${eventId}`, payload);
    return res.data;
  },
  updateBudgetCategory: async (eventId: number, budgetId: number, payload: Partial<BudgetItem>): Promise<BudgetItem> => {
    const res = await apiClient.put(`/budgets/${eventId}/${budgetId}`, payload);
    return res.data;
  },
  deleteBudgetCategory: async (eventId: number, budgetId: number): Promise<void> => {
    await apiClient.delete(`/budgets/${eventId}/${budgetId}`);
  },

  // Expenses
  getExpenses: async (eventId: number): Promise<ExpenseItem[]> => {
    const res = await apiClient.get(`/expenses/${eventId}`);
    return res.data;
  },
  createExpense: async (eventId: number, payload: Partial<ExpenseItem>): Promise<ExpenseItem> => {
    const res = await apiClient.post(`/expenses/${eventId}`, payload);
    return res.data;
  },
  updateExpense: async (eventId: number, expenseId: number, payload: Partial<ExpenseItem>): Promise<ExpenseItem> => {
    const res = await apiClient.put(`/expenses/${eventId}/${expenseId}`, payload);
    return res.data;
  },
  deleteExpense: async (eventId: number, expenseId: number): Promise<void> => {
    await apiClient.delete(`/expenses/${eventId}/${expenseId}`);
  },

  // Tasks
  getTasks: async (eventId: number, filters?: { status?: string; priority?: string }): Promise<TaskItem[]> => {
    const res = await apiClient.get(`/tasks/${eventId}`, { params: filters });
    return res.data;
  },
  createTask: async (eventId: number, payload: Partial<TaskItem>): Promise<TaskItem> => {
    const res = await apiClient.post(`/tasks/${eventId}`, payload);
    return res.data;
  },
  updateTask: async (eventId: number, taskId: number, payload: Partial<TaskItem>): Promise<TaskItem> => {
    const res = await apiClient.put(`/tasks/${eventId}/${taskId}`, payload);
    return res.data;
  },
  deleteTask: async (eventId: number, taskId: number): Promise<void> => {
    await apiClient.delete(`/tasks/${eventId}/${taskId}`);
  },

  // Vendors
  getVendors: async (eventId: number): Promise<VendorItem[]> => {
    const res = await apiClient.get(`/vendors/${eventId}`);
    return res.data;
  },
  createVendor: async (eventId: number, payload: Partial<VendorItem>): Promise<VendorItem> => {
    const res = await apiClient.post(`/vendors/${eventId}`, payload);
    return res.data;
  },
  updateVendor: async (eventId: number, vendorId: number, payload: Partial<VendorItem>): Promise<VendorItem> => {
    const res = await apiClient.put(`/vendors/${eventId}/${vendorId}`, payload);
    return res.data;
  },
  deleteVendor: async (eventId: number, vendorId: number): Promise<void> => {
    await apiClient.delete(`/vendors/${eventId}/${vendorId}`);
  },

  // AI Services
  generatePlan: async (eventId: number): Promise<FullEventPlan> => {
    const res = await apiClient.post('/ai/generate-plan', { event_id: eventId });
    return res.data;
  },
  optimizeBudget: async (eventId: number, targetReductionPct: number = 10): Promise<any> => {
    const res = await apiClient.post('/ai/optimize-budget', {
      event_id: eventId,
      target_reduction_percentage: targetReductionPct,
    });
    return res.data;
  },
  generateTimeline: async (eventId: number): Promise<any> => {
    const res = await apiClient.post('/ai/generate-timeline', { event_id: eventId });
    return res.data;
  },
  getRecommendations: async (eventId: number, categoryFocus?: string): Promise<any> => {
    const res = await apiClient.post('/ai/recommendations', {
      event_id: eventId,
      category_focus: categoryFocus,
    });
    return res.data;
  },
  sendChatMessage: async (message: string, eventId?: number): Promise<ChatMessage> => {
    const res = await apiClient.post('/ai/chat', { message, event_id: eventId });
    return res.data;
  },
  confirmEventChange: async (eventId: number, changeType: string, payload: Record<string, any>): Promise<any> => {
    const res = await apiClient.post('/ai/confirm-change', null, {
      params: { event_id: eventId, change_type: changeType },
      data: payload,
    });
    return res.data;
  },
  getChatHistory: async (eventId: number): Promise<ChatMessage[]> => {
    const res = await apiClient.get(`/ai/history/${eventId}`);
    return res.data;
  },
};
