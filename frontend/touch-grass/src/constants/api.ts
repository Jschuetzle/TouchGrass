import Constants from 'expo-constants';

export const BASE_URL = `http://${Constants.expoConfig.extra.backendIP}:${Constants.expoConfig.extra.backendPort ?? ''}`;