import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://abbey-circle-api.onrender.com";

export const api = axios.create({ baseURL: BASE_URL });

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export async function saveRefreshToken(token: string) {
  await AsyncStorage.setItem("refreshToken", token);
}

export async function getStoredRefreshToken() {
  return AsyncStorage.getItem("refreshToken");
}

export async function clearRefreshToken() {
  await AsyncStorage.removeItem("refreshToken");
}