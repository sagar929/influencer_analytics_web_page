import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:9000/api'
});

export async function analyzeHandle(handle) {
  const { data } = await api.post('/analyze', { handle });
  return data;
}