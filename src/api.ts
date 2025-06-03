// src/api.ts
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://192.168.33.252:8080',  // ← 여기만 복사하신 IPv4 주소로 변경하세요
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export default API;
