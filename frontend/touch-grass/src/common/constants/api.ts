import Constants from "expo-constants";

export enum DashboardStatus {
  NEW_USER = "NEW_USER",
  EXISTING_USER = "EXISTING_USER",
}

export const BACKEND_PORT = Constants.expoConfig.extra.backendPort;
export const BASE_URL = `http://${Constants.expoConfig.extra.backendIP}${BACKEND_PORT ? `:${BACKEND_PORT}` : ''}`;
