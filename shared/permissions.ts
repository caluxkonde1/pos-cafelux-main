export interface FeaturePermissions {
  // Basic POS Features
  basicPOS: boolean;
  qrisPayment: boolean;
  scanProduct: boolean;
  basicReporting: boolean;
  
  // Product Management
  maxProducts: number | null; // null = unlimited
  productCategories: boolean;
  productDiscounts: boolean;
  exportProducts: boolean;
  productTax: boolean;
  bulkProducts: boolean;
  productExpiry: boolean;
  wholesalePricing: boolean;
  
  // Employee Management  
  maxEmployees: number | null; // null = unlimited
  employeeTracking: boolean;
  employeeAutomation: boolean;
  
  // Customer Management
  customerManagement: boolean;
  customerTiers: boolean;
  
  // Advanced Reporting
  advancedReporting: boolean;
  unlimitedReportingPeriod: boolean;
  salesAnalytics: boolean;
  
  // Restaurant Features
  kitchenDisplay: boolean;
  orderTracking: boolean;
  receiptBranding: boolean;
  receiptCustomization: boolean;
  preOrders: boolean;
  paymentLabels: boolean;
  
  // Multi-outlet
  maxOutlets: number | null; // null = unlimited
  multiOutletManagement: boolean;
  
  // Integrations
  apiAccess: boolean;
  webhooks: boolean;
}

export const PLAN_PERMISSIONS: Record<string, FeaturePermissions> = {
  free: {
    // Basic Features
    basicPOS: true,
    qrisPayment: true,
    scanProduct: true,
    basicReporting: true,
    
    // Product Management
    maxProducts: 50,
    productCategories: true,
    productDiscounts: false,
    exportProducts: false,
    productTax: false,
    bulkProducts: false,
    productExpiry: false,
    wholesalePricing: false,
    
    // Employee Management
    maxEmployees: 2,
    employeeTracking: false,
    employeeAutomation: false,
    
    // Customer Management
    customerManagement: true,
    customerTiers: false,
    
    // Advanced Reporting
    advancedReporting: false,
    unlimitedReportingPeriod: false,
    salesAnalytics: false,
    
    // Restaurant Features
    kitchenDisplay: false,
    orderTracking: false,
    receiptBranding: false,
    receiptCustomization: false,
    preOrders: false,
    paymentLabels: false,
    
    // Multi-outlet
    maxOutlets: 1,
    multiOutletManagement: false,
    
    // Integrations
    apiAccess: false,
    webhooks: false,
  },
  
  pro: {
    // Basic Features
    basicPOS: true,
    qrisPayment: true,
    scanProduct: true,
    basicReporting: true,
    
    // Product Management
    maxProducts: null, // unlimited
    productCategories: true,
    productDiscounts: true,
    exportProducts: true,
    productTax: true,
    bulkProducts: true,
    productExpiry: false,
    wholesalePricing: false,
    
    // Employee Management
    maxEmployees: null, // unlimited
    employeeTracking: true,
    employeeAutomation: true,
    
    // Customer Management
    customerManagement: true,
    customerTiers: true,
    
    // Advanced Reporting
    advancedReporting: true,
    unlimitedReportingPeriod: true,
    salesAnalytics: true,
    
    // Restaurant Features
    kitchenDisplay: false,
    orderTracking: false,
    receiptBranding: false,
    receiptCustomization: false,
    preOrders: false,
    paymentLabels: false,
    
    // Multi-outlet
    maxOutlets: 1,
    multiOutletManagement: false,
    
    // Integrations
    apiAccess: true,
    webhooks: false,
  },
  
  pro_plus: {
    // Basic Features
    basicPOS: true,
    qrisPayment: true,
    scanProduct: true,
    basicReporting: true,
    
    // Product Management
    maxProducts: null, // unlimited
    productCategories: true,
    productDiscounts: true,
    exportProducts: true,
    productTax: true,
    bulkProducts: true,
    productExpiry: true,
    wholesalePricing: true,
    
    // Employee Management
    maxEmployees: null, // unlimited
    employeeTracking: true,
    employeeAutomation: true,
    
    // Customer Management
    customerManagement: true,
    customerTiers: true,
    
    // Advanced Reporting
    advancedReporting: true,
    unlimitedReportingPeriod: true,
    salesAnalytics: true,
    
    // Restaurant Features
    kitchenDisplay: true,
    orderTracking: true,
    receiptBranding: true,
    receiptCustomization: true,
    preOrders: true,
    paymentLabels: true,
    
    // Multi-outlet
    maxOutlets: null, // unlimited
    multiOutletManagement: true,
    
    // Integrations
    apiAccess: true,
    webhooks: true,
  }
};

export function getUserPermissions(subscriptionPlan: string): FeaturePermissions {
  return PLAN_PERMISSIONS[subscriptionPlan] || PLAN_PERMISSIONS.free;
}

export function hasPermission(
  subscriptionPlan: string, 
  feature: keyof FeaturePermissions
): boolean {
  const permissions = getUserPermissions(subscriptionPlan);
  return permissions[feature] as boolean;
}

export function getMaxLimit(
  subscriptionPlan: string, 
  feature: 'maxProducts' | 'maxEmployees' | 'maxOutlets'
): number | null {
  const permissions = getUserPermissions(subscriptionPlan);
  return permissions[feature];
}

// Admin role always has access to all features
export function checkFeatureAccess(
  userRole: string,
  subscriptionPlan: string,
  feature: keyof FeaturePermissions
): boolean {
  if (userRole === 'admin') {
    return true; // Admin has access to everything
  }
  
  return hasPermission(subscriptionPlan, feature);
}

export function checkLimitAccess(
  userRole: string,
  subscriptionPlan: string,
  feature: 'maxProducts' | 'maxEmployees' | 'maxOutlets',
  currentCount: number
): { allowed: boolean; limit: number | null; message?: string } {
  if (userRole === 'admin') {
    return { allowed: true, limit: null }; // Admin has no limits
  }
  
  const limit = getMaxLimit(subscriptionPlan, feature);
  
  if (limit === null) {
    return { allowed: true, limit: null }; // Unlimited
  }
  
  if (currentCount >= limit) {
    return { 
      allowed: false, 
      limit, 
      message: `Batas maksimal ${feature === 'maxProducts' ? 'produk' : feature === 'maxEmployees' ? 'pegawai' : 'outlet'} adalah ${limit}. Upgrade ke paket Pro untuk lebih banyak.`
    };
  }
  
  return { allowed: true, limit };
}