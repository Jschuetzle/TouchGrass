import Constants from "expo-constants";

export enum DashboardStatus {
  NEW_USER = "NEW_USER",
  EXISTING_USER = "EXISTING_USER",
}

export const BASE_URL = `http://${Constants.expoConfig.extra.backendIP}:${Constants.expoConfig.extra.backendPort}`;
