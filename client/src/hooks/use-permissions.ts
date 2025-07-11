import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getUserPermissions, checkFeatureAccess, checkLimitAccess, FeaturePermissions } from "@shared/permissions";

// Mock user context - in real app this would come from auth context
const useCurrentUser = () => {
  const { data: users = [], isError } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
  // If API fails, return a mock admin user for development
  if (isError || users.length === 0) {
    return {
      id: 1,
      username: 'admin',
      email: 'admin@cafelux.com',
      role: 'admin' as const,
      subscriptionPlan: 'pro' as const,
      subscriptionStatus: 'active' as const,
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  // For demo, return the admin user (in real app this would be from authentication)
  return users.find(user => user.role === 'admin') || null;
};

export function usePermissions() {
  const currentUser = useCurrentUser();
  
  const permissions = useMemo((): FeaturePermissions | null => {
    if (!currentUser) return null;
    return getUserPermissions(currentUser.subscriptionPlan);
  }, [currentUser?.subscriptionPlan]);
  
  const hasFeature = (feature: keyof FeaturePermissions): boolean => {
    if (!currentUser || !permissions) return false;
    return checkFeatureAccess(currentUser.role, currentUser.subscriptionPlan, feature);
  };
  
  const checkLimit = (
    feature: 'maxProducts' | 'maxEmployees' | 'maxOutlets',
    currentCount: number
  ) => {
    if (!currentUser) {
      return { allowed: false, limit: null, message: 'User not authenticated' };
    }
    
    return checkLimitAccess(currentUser.role, currentUser.subscriptionPlan, feature, currentCount);
  };
  
  const getPlanInfo = () => {
    if (!currentUser) return null;
    
    return {
      plan: currentUser.subscriptionPlan,
      status: currentUser.subscriptionStatus,
      expiresAt: currentUser.subscriptionExpiresAt,
      isActive: currentUser.subscriptionStatus === 'active',
      isAdmin: currentUser.role === 'admin'
    };
  };
  
  return {
    permissions,
    hasFeature,
    checkLimit,
    getPlanInfo,
    currentUser,
    isLoading: !currentUser && !permissions,
  };
}

export default usePermissions;