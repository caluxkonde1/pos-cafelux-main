import { useQuery } from "@tanstack/react-query";
import type { DashboardStatsType, Product, TransactionWithItems } from "@shared/schema";

export function useDashboardStats() {
  return useQuery<DashboardStatsType>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useTopProducts(limit = 5) {
  return useQuery<(Product & { totalTerjual: number })[]>({
    queryKey: ["/api/dashboard/top-products", limit],
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useRecentTransactions(limit = 5) {
  return useQuery<TransactionWithItems[]>({
    queryKey: ["/api/dashboard/recent-transactions", limit],
    refetchInterval: 15000, // Refresh every 15 seconds
  });
}
