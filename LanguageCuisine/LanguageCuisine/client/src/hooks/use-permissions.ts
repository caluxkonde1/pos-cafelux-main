import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getUserPermissions, checkFeatureAccess, checkLimitAccess, FeaturePermissions } from "@shared/permissions";

// Mock user context - in real app this would come from auth context
const useCurrentUser = () => {
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
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