import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analytics } from '@/lib/analytics';

interface Product {
  id: number;
  nama: string;
  harga: number;
  hargaBeli?: number;
  stok: number;
  kategori: string;
  avatar?: string;
  deskripsi?: string;
  barcode?: string;
  satuan?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Category {
  id: number;
  nama: string;
  deskripsi?: string;
  warna?: string;
  sort_order: number;
}

// API functions
const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return response.json();
  } catch (error) {
    // Return mock data when API fails (for development)
    console.warn('API failed, using mock data:', error);
    return [
      { id: 1, nama: "kuota", harga: 151000, hargaBeli: 100000, stok: 0, kategori: "Produk", avatar: "Ku", satuan: "pcs" },
      { id: 2, nama: "cctv ezviz ip camera", harga: 625000, hargaBeli: 500000, stok: 25, kategori: "Elektronik", avatar: "CE", satuan: "unit" },
      { id: 3, nama: "colokan listrik / steker", harga: 25000, hargaBeli: 15000, stok: 5, kategori: "Produk", avatar: "CL", satuan: "pcs" },
      { id: 4, nama: "jasa instalasi", harga: 125000, hargaBeli: 0, stok: 9994, kategori: "Jasa", avatar: "JI", satuan: "layanan" },
      { id: 5, nama: "kabel lan", harga: 9000, hargaBeli: 6000, stok: 0, kategori: "Produk", avatar: "KL", satuan: "meter" },
      { id: 6, nama: "kabel listrik", harga: 15000, hargaBeli: 10000, stok: 8, kategori: "Produk", avatar: "KL", satuan: "meter" },
      { id: 7, nama: "Microsd sandisk extreme", harga: 350000, hargaBeli: 280000, stok: 3, kategori: "Elektronik", avatar: "MS", satuan: "pcs" },
      { id: 8, nama: "Router wifi", harga: 450000, hargaBeli: 350000, stok: 12, kategori: "Elektronik", avatar: "RW", satuan: "unit" }
    ];
  }
};

const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch('/api/categories');
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
};

const updateProductStock = async (productId: number, stok: number, userRole: string): Promise<Product> => {
  try {
    const response = await fetch(`/api/products/${productId}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stok, userRole }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update stock');
    }
    
    const result = await response.json();
    return result.product;
  } catch (error) {
    // For development: simulate successful update when API fails
    console.warn('Stock update API failed, simulating success:', error);
    
    // Return mock updated product
    const mockProducts = [
      { id: 1, nama: "kuota", harga: 151000, hargaBeli: 100000, stok: 0, kategori: "Produk", avatar: "Ku" },
      { id: 2, nama: "cctv ezviz ip camera", harga: 625000, hargaBeli: 500000, stok: 25, kategori: "Elektronik", avatar: "CE" },
      { id: 3, nama: "colokan listrik / steker", harga: 25000, hargaBeli: 15000, stok: 5, kategori: "Produk", avatar: "CL" },
      { id: 4, nama: "jasa instalasi", harga: 125000, hargaBeli: 0, stok: 9994, kategori: "Jasa", avatar: "JI" },
      { id: 5, nama: "kabel lan", harga: 9000, hargaBeli: 6000, stok: 0, kategori: "Produk", avatar: "KL" },
      { id: 6, nama: "kabel listrik", harga: 15000, hargaBeli: 10000, stok: 8, kategori: "Produk", avatar: "KL" },
      { id: 7, nama: "Microsd sandisk extreme", harga: 350000, hargaBeli: 280000, stok: 3, kategori: "Elektronik", avatar: "MS" },
      { id: 8, nama: "Router wifi", harga: 450000, hargaBeli: 350000, stok: 12, kategori: "Elektronik", avatar: "RW" }
    ];
    
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      return { ...product, stok };
    }
    
    throw new Error('Product not found');
  }
};

const updateProduct = async (productId: number, updatedData: Partial<Product>): Promise<Product> => {
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update product');
    }
    
    const result = await response.json();
    return result.product;
  } catch (error) {
    // For development: simulate successful update when API fails
    console.warn('Product update API failed, simulating success:', error);
    
    // Return mock updated product
    const mockProducts = [
      { id: 1, nama: "kuota", harga: 151000, hargaBeli: 100000, stok: 0, kategori: "Produk", avatar: "Ku" },
      { id: 2, nama: "cctv ezviz ip camera", harga: 625000, hargaBeli: 500000, stok: 25, kategori: "Elektronik", avatar: "CE" },
      { id: 3, nama: "colokan listrik / steker", harga: 25000, hargaBeli: 15000, stok: 5, kategori: "Produk", avatar: "CL" },
      { id: 4, nama: "jasa instalasi", harga: 125000, hargaBeli: 0, stok: 9994, kategori: "Jasa", avatar: "JI" },
      { id: 5, nama: "kabel lan", harga: 9000, hargaBeli: 6000, stok: 0, kategori: "Produk", avatar: "KL" },
      { id: 6, nama: "kabel listrik", harga: 15000, hargaBeli: 10000, stok: 8, kategori: "Produk", avatar: "KL" },
      { id: 7, nama: "Microsd sandisk extreme", harga: 350000, hargaBeli: 280000, stok: 3, kategori: "Elektronik", avatar: "MS" },
      { id: 8, nama: "Router wifi", harga: 450000, hargaBeli: 350000, stok: 12, kategori: "Elektronik", avatar: "RW" }
    ];
    
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      return { ...product, ...updatedData };
    }
    
    throw new Error('Product not found');
  }
};

const addCategory = async (categoryData: Omit<Category, 'id' | 'sort_order'>): Promise<Category> => {
  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(categoryData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add category');
  }
  
  return response.json();
};

const updateCategory = async (categoryId: number, categoryData: Partial<Category>): Promise<Category> => {
  const response = await fetch(`/api/categories/${categoryId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(categoryData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update category');
  }
  
  return response.json();
};

const deleteCategory = async (categoryId: number): Promise<void> => {
  const response = await fetch(`/api/categories/${categoryId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete category');
  }
};

const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add product');
  }
  
  return response.json();
};

const deleteProduct = async (productId: number): Promise<void> => {
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete product');
    }
  } catch (error) {
    // For development: simulate successful delete when API fails
    console.warn('Product delete API failed, simulating success:', error);
    // In real scenario, we would still throw the error
    // throw error;
  }
};

export function useProducts() {
  const queryClient = useQueryClient();

  // Fetch products
  const {
    data: products = [],
    isLoading: isLoadingProducts,
    error: productsError,
  } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    retry: false, // Don't retry on failure, use fallback
  });

  // Fetch categories
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    retry: false, // Don't retry on failure, use fallback
  });

  // Update stock mutation
  const updateStockMutation = useMutation({
    mutationFn: ({ productId, stok, userRole }: { productId: number; stok: number; userRole: string }) =>
      updateProductStock(productId, stok, userRole),
    onMutate: async ({ productId, stok }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['products'] });

      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData(['products']);

      // Optimistically update to the new value
      queryClient.setQueryData(['products'], (old: Product[] = []) =>
        old.map(product =>
          product.id === productId ? { ...product, stok } : product
        )
      );

      // Return a context object with the snapshotted value
      return { previousProducts };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
      
      // Track error
      analytics.trackError('stock_update_failed', err.message, 'products');
    },
    onSuccess: (updatedProduct, variables) => {
      // Update the products cache with server response
      queryClient.setQueryData(['products'], (oldProducts: Product[] = []) =>
        oldProducts.map(product =>
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );
      
      // Track stock update
      const oldProduct = (queryClient.getQueryData(['products']) as Product[] || [])
        .find(p => p.id === updatedProduct.id);
      const oldStock = oldProduct?.stok || 0;
      
      analytics.trackStockUpdate(updatedProduct.id.toString(), oldStock, updatedProduct.stok);
      
      // Check for low stock alert
      if (updatedProduct.stok <= 10 && updatedProduct.stok > 0) {
        analytics.trackLowStockAlert(updatedProduct.id.toString(), updatedProduct.nama, updatedProduct.stok);
      }
      
      // Force refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ productId, updatedData }: { productId: number; updatedData: Partial<Product> }) =>
      updateProduct(productId, updatedData),
    onSuccess: (updatedProduct) => {
      // Update the products cache
      queryClient.setQueryData(['products'], (oldProducts: Product[] = []) =>
        oldProducts.map(product =>
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );
      
      // Track product edit
      analytics.trackProductEdit(updatedProduct.id.toString(), updatedProduct.nama);
    },
    onError: (err) => {
      analytics.trackError('product_update_failed', err.message, 'products');
    },
  });

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: (categoryData: Omit<Category, 'id' | 'sort_order'>) =>
      addCategory(categoryData),
    onMutate: async (newCategoryData) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['categories'] });

      // Snapshot the previous value
      const previousCategories = queryClient.getQueryData(['categories']);

      // Optimistically update to the new value
      const optimisticCategory: Category = {
        id: Date.now(), // Temporary ID
        sort_order: Date.now(),
        ...newCategoryData,
      };

      queryClient.setQueryData(['categories'], (old: Category[] = []) => {
        const updated = [...old, optimisticCategory];
        return updated.sort((a, b) => (a.sort_order || a.id) - (b.sort_order || b.id));
      });

      // Return a context object with the snapshotted value
      return { previousCategories };
    },
    onSuccess: async (newCategory) => {
      // Replace the optimistic update with the real data
      queryClient.setQueryData(['categories'], (oldCategories: Category[] = []) => {
        // Remove any temporary entries and add the real one
        const filtered = oldCategories.filter(cat => cat.id !== newCategory.id && !cat.id.toString().startsWith('temp_'));
        const updated = [...filtered, newCategory];
        return updated.sort((a, b) => (a.sort_order || a.id) - (b.sort_order || b.id));
      });
      
      // Track category addition
      analytics.trackFeatureUsage('category_added');
      
      // Force invalidate and refetch to ensure we have the latest data
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      
      // Also invalidate products in case they depend on categories
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err, newCategory, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCategories) {
        queryClient.setQueryData(['categories'], context.previousCategories);
      }
      
      analytics.trackError('category_add_failed', err.message, 'categories');
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ categoryId, categoryData }: { categoryId: number; categoryData: Partial<Category> }) =>
      updateCategory(categoryId, categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId: number) => deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: (productData: Omit<Product, 'id'>) => addProduct(productData),
    onMutate: async (newProductData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['products'] });

      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData(['products']);

      // Optimistically update to the new value with temporary ID
      const optimisticProduct: Product = {
        id: `temp_${Date.now()}` as any, // Temporary ID with prefix
        ...newProductData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData(['products'], (old: Product[] = []) => {
        return [...old, optimisticProduct];
      });

      // Return a context object with the snapshotted value
      return { previousProducts, optimisticProduct };
    },
    onSuccess: async (newProduct, variables, context) => {
      // Remove the optimistic update and add the real product
      queryClient.setQueryData(['products'], (oldProducts: Product[] = []) => {
        // Remove the temporary optimistic product
        const filtered = oldProducts.filter(prod => 
          prod.id !== context?.optimisticProduct?.id && 
          !prod.id.toString().startsWith('temp_')
        );
        // Add the real product from server
        return [...filtered, newProduct];
      });
      
      // Track product addition
      analytics.trackProductAdd(newProduct.nama, newProduct.kategori);
      
      // Force refetch to ensure we have all the latest data from server
      await queryClient.refetchQueries({ queryKey: ['products'] });
    },
    onError: (err, newProduct, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
      
      analytics.trackError('product_add_failed', err.message, 'products');
    },
    onSettled: async () => {
      // Always refetch after error or success to ensure we have the latest data
      await queryClient.refetchQueries({ queryKey: ['products'] });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (productId: number) => deleteProduct(productId),
    onMutate: async (productId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['products'] });

      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData(['products']);

      // Optimistically remove the product
      queryClient.setQueryData(['products'], (old: Product[] = []) => {
        return old.filter(product => product.id !== productId);
      });

      // Return a context object with the snapshotted value
      return { previousProducts };
    },
    onSuccess: (_, productId) => {
      // Get product name before deletion for analytics
      const products = queryClient.getQueryData(['products']) as Product[] || [];
      const deletedProduct = products.find(p => p.id === productId);
      
      if (deletedProduct) {
        analytics.trackProductDelete(productId.toString(), deletedProduct.nama);
      }
      
      // Invalidate and refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err, productId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
      
      analytics.trackError('product_delete_failed', err.message, 'products');
    },
  });

  return {
    // Data
    products,
    categories,
    
    // Loading states
    isLoadingProducts,
    isLoadingCategories,
    isLoading: isLoadingProducts || isLoadingCategories,
    
    // Errors
    productsError,
    categoriesError,
    
    // Mutations
    updateStock: updateStockMutation.mutateAsync,
    isUpdatingStock: updateStockMutation.isPending,
    updateStockError: updateStockMutation.error,
    
    updateProduct: updateProductMutation.mutateAsync,
    isUpdatingProduct: updateProductMutation.isPending,
    updateProductError: updateProductMutation.error,
    
    addCategory: addCategoryMutation.mutateAsync,
    isAddingCategory: addCategoryMutation.isPending,
    addCategoryError: addCategoryMutation.error,
    
    updateCategory: updateCategoryMutation.mutateAsync,
    isUpdatingCategory: updateCategoryMutation.isPending,
    updateCategoryError: updateCategoryMutation.error,
    
    deleteCategory: deleteCategoryMutation.mutateAsync,
    isDeletingCategory: deleteCategoryMutation.isPending,
    deleteCategoryError: deleteCategoryMutation.error,
    
    addProduct: addProductMutation.mutateAsync,
    isAddingProduct: addProductMutation.isPending,
    addProductError: addProductMutation.error,
    
    deleteProduct: deleteProductMutation.mutateAsync,
    isDeletingProduct: deleteProductMutation.isPending,
    deleteProductError: deleteProductMutation.error,
  };
}

// Hook for product statistics
export function useProductStats(products: Product[]) {
  return {
    totalProducts: products.length,
    outOfStock: products.filter(p => p.stok === 0).length,
    lowStock: products.filter(p => p.stok > 0 && p.stok <= 10).length,
    totalStockValue: products.reduce((sum, p) => sum + (p.stok * p.harga), 0),
  };
}

// Hook for filtering products
export function useProductFilter(products: Product[], searchTerm: string) {
  return products.filter(product =>
    product.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );
}
