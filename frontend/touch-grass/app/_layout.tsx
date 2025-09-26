import { Slot, Stack, useRouter } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';
import { getDashboard } from '@/api/dashboard';
import { DashboardResponseDto } from '@/common/dto/dashboard/DashboardResponseDto';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { DashboardStatus } from '@/common/constants/api';
import Gate from '@/components/Gate';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
