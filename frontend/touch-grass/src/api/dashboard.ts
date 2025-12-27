import { BASE_URL } from "@/common/constants/api";
import { secureFetch } from "@/services/api";
import { DashboardResponseDto } from '@/common/dto/response/DashboardResponseDto';
import { plainToInstance } from "class-transformer";

export async function getDashboard(): Promise<DashboardResponseDto>  {
  try {
    const response = await secureFetch(`${BASE_URL}/dashboard`, {
      method: 'GET',
    });

    if (!response?.ok) {
      throw new Error(`HTTP ${response?.status}`);
    }

    const json = await response.json();
    return plainToInstance(DashboardResponseDto, json, { excludeExtraneousValues: true });
  } catch (err) {
    console.error('Error fetching /dashboard:', err);
    throw err;
  }
}