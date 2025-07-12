import { track } from '@vercel/analytics';

// Custom analytics events for POS CafeLux
export const analytics = {
  // Product Management Events
  trackProductAdd: (productName: string, category: string) => {
    track('product_added', {
      product_name: productName,
      category: category,
      timestamp: new Date().toISOString()
    });
  },

  trackProductEdit: (productId: string, productName: string) => {
    track('product_edited', {
      product_id: productId,
      product_name: productName,
      timestamp: new Date().toISOString()
    });
  },

  trackProductDelete: (productId: string, productName: string) => {
    track('product_deleted', {
      product_id: productId,
      product_name: productName,
      timestamp: new Date().toISOString()
    });
  },

  // Sales Events
  trackSaleComplete: (amount: number, itemCount: number, paymentMethod: string) => {
    track('sale_completed', {
      amount: amount,
      item_count: itemCount,
      payment_method: paymentMethod,
      timestamp: new Date().toISOString()
    });
  },

  trackSaleCancel: (reason: string) => {
    track('sale_cancelled', {
      reason: reason,
      timestamp: new Date().toISOString()
    });
  },

  // Inventory Events
  trackStockUpdate: (productId: string, oldStock: number, newStock: number) => {
    track('stock_updated', {
      product_id: productId,
      old_stock: oldStock,
      new_stock: newStock,
      difference: newStock - oldStock,
      timestamp: new Date().toISOString()
    });
  },

  trackLowStockAlert: (productId: string, productName: string, currentStock: number) => {
    track('low_stock_alert', {
      product_id: productId,
      product_name: productName,
      current_stock: currentStock,
      timestamp: new Date().toISOString()
    });
  },

  // User Activity Events
  trackPageView: (pageName: string, userRole?: string) => {
    track('page_view', {
      page_name: pageName,
      user_role: userRole || 'unknown',
      timestamp: new Date().toISOString()
    });
  },

  trackUserLogin: (userRole: string, loginMethod: string) => {
    track('user_login', {
      user_role: userRole,
      login_method: loginMethod,
      timestamp: new Date().toISOString()
    });
  },

  trackUserLogout: (sessionDuration: number) => {
    track('user_logout', {
      session_duration: sessionDuration,
      timestamp: new Date().toISOString()
    });
  },

  // Customer Events
  trackCustomerAdd: (customerType: string) => {
    track('customer_added', {
      customer_type: customerType,
      timestamp: new Date().toISOString()
    });
  },

  trackCustomerEdit: (customerId: string) => {
    track('customer_edited', {
      customer_id: customerId,
      timestamp: new Date().toISOString()
    });
  },

  // Report Events
  trackReportGenerate: (reportType: string, dateRange: string) => {
    track('report_generated', {
      report_type: reportType,
      date_range: dateRange,
      timestamp: new Date().toISOString()
    });
  },

  trackReportExport: (reportType: string, exportFormat: string) => {
    track('report_exported', {
      report_type: reportType,
      export_format: exportFormat,
      timestamp: new Date().toISOString()
    });
  },

  // Error Events
  trackError: (errorType: string, errorMessage: string, page: string) => {
    track('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
      page: page,
      timestamp: new Date().toISOString()
    });
  },

  // Performance Events
  trackPerformance: (action: string, duration: number) => {
    track('performance_metric', {
      action: action,
      duration: duration,
      timestamp: new Date().toISOString()
    });
  },

  // Feature Usage Events
  trackFeatureUsage: (featureName: string, userRole?: string) => {
    track('feature_used', {
      feature_name: featureName,
      user_role: userRole || 'unknown',
      timestamp: new Date().toISOString()
    });
  },

  // Business Metrics
  trackDailySummary: (totalSales: number, totalTransactions: number, averageOrderValue: number) => {
    track('daily_summary', {
      total_sales: totalSales,
      total_transactions: totalTransactions,
      average_order_value: averageOrderValue,
      timestamp: new Date().toISOString()
    });
  }
};

// Utility functions for analytics
export const analyticsUtils = {
  // Get session duration
  getSessionDuration: (startTime: Date): number => {
    return Date.now() - startTime.getTime();
  },

  // Format currency for analytics
  formatCurrency: (amount: number): number => {
    return Math.round(amount * 100) / 100; // Round to 2 decimal places
  },

  // Get user role from context (you can customize this based on your auth system)
  getCurrentUserRole: (): string => {
    // This should be replaced with your actual user role detection logic
    return localStorage.getItem('userRole') || 'unknown';
  },

  // Batch analytics events (useful for bulk operations)
  batchTrack: (events: Array<{ name: string; properties: Record<string, any> }>) => {
    events.forEach(event => {
      track(event.name, event.properties);
    });
  }
};

export default analytics;
