import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// Turns an Axios error into a message a user can understand
export function getErrorMessage(err) {
  if (err.response) return err.response.data?.message || 'The server returned an error.';
  return 'Cannot reach the backend server. Make sure it is running (npm start in the backend folder).';
}

export const fetchTransactions = (params = {}) => api.get('/transactions', { params }).then((r) => r.data);
export const createTransaction = (data) => api.post('/transactions', data).then((r) => r.data);
export const updateTransaction = (id, data) => api.put(`/transactions/${id}`, data).then((r) => r.data);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`).then((r) => r.data);
