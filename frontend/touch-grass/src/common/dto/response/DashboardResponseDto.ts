import { DashboardStatus } from "@/common/constants/api";
import { TouchgrassUser } from "@/common/types/user";

export type DashboardResponseDto = {
  status: DashboardStatus;
  data: TouchgrassUser | Partial<TouchgrassUser>;
}