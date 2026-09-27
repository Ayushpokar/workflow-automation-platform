import { apiClient } from "./client";
import type { LoginPayload, RegisterPayload, TokenResponse, User } from "../types/auth";

export async function register(payload:RegisterPayload): Promise<User> {
    const { data } = await apiClient.post<User>("/auth/register", payload);
    console.log(data)
    return data
}

export async function login(payload:LoginPayload): Promise<TokenResponse> {
    const {data} = await apiClient.post<TokenResponse>("/auth/login", payload);
    localStorage.setItem("access_token", data.access_token)
    localStorage.setItem("refresh_token", data.refresh_token)
    return data;
}

export async function getCurrentUser(): Promise<User> {
    const {data} = await apiClient.get<User>("/auth/me")
    return data
}

export function logout(){
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
}