import { BASE_URL } from "@/common/constants/api";
import { secureFetch } from "@/services/api";
import { DashboardResponseDto } from '@/common/dto/response/DashboardResponseDto';

export async function getDashboard(): Promise<DashboardResponseDto>  {
  try {
    const response = await secureFetch(`${BASE_URL}/dashboard`, {
      method: 'GET',
    });

    if (!response?.ok) {
      throw new Error(`HTTP ${response?.status}`);
    }

    return await response.json() as DashboardResponseDto;
  } catch (err) {
    console.error('Error fetching /dashboard:', err);
    throw err;
  }
}