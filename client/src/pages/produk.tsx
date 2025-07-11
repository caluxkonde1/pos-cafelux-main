import { useState, useEffect, useMemo } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Search, Filter, ArrowLeft, Plus, Package, AlertTriangle, TrendingDown, Settings } from "lucide-react";
import { AddProductModal } from "../components/add-product-modal";
import { AddCategoryModal } from "../components/add-category-modal";
import { EditStockModal } from "../components/edit-stock-modal";
import { EditProductModal } from "../components/edit-product-modal";
import { usePermissions } from "../hooks/use-permissions";
import { useProducts, useProductStats, useProductFilter } from "../hooks/use-products";

// Mock data sebagai fallback
const mockProducts = [
  { id: 1, nama: "kuota", harga: 151000, stok: 0, kategori: "Produk", avatar: "Ku" },
  { id: 2, nama: "cctv ezviz ip camera", harga: 625000, stok: 25, kategori: "Elektronik", avatar: "CE" },
  { id: 3, nama: "colokan listrik / steker", harga: 25000, stok: 5, kategori: "Produk", avatar: "CL" },
  { id: 4, nama: "jasa instalasi", harga: 125000, stok: 9994, kategori: "Produk", avatar: "JI" },
  { id: 5, nama: "kabel lan", harga: 9000, stok: 0, kategori: "Produk", avatar: "KL" },
  { id: 6, nama: "kabel listrik", harga: 15000, stok: 8, kategori: "Elektronik", avatar: "KL" },
  { id: 7, nama: "Microsd sandisk extreme", harga: 350000, stok: 3, kategori: "Elektronik", avatar: "MS" },
  { id: 8, nama: "Modem / router", harga: 650000, stok: 15, kategori: "Elektronik", avatar: "M/" },
];

const mockCategories = [
  { id: 1, nama: "Produk", sort_order: 1, warna: "#ef4444", deskripsi: "" },
  { id: 2, nama: "Elektronik", sort_order: 2, warna: "#3b82f6", deskripsi: "" },
  { id: 3, nama: "Minuman", sort_order: 3, warna: "#10b981", deskripsi: "" },
];

interface Product {
  id: number;
  nama: string;
  harga: number;
  stok: number;
  kategori: string;
  avatar?: string;
}

interface Category {
  id: number;
  nama: string;
  deskripsi?: string;
  warna?: string;
  sort_order: number;
}

export default function Produk() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Produk");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [stockFilter, setStockFilter] = useState<string>("Semua");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const { currentUser } = usePermissions();
  
  // Use database hook with fallback to mock data
  const { 
    products: dbProducts, 
    categories: dbCategories, 
    isLoading, 
    updateStock,
    isUpdatingStock,
    updateProduct,
    isUpdatingProduct
  } = useProducts();
  
  // Use database data if available, otherwise fallback to mock data
  const products = dbProducts.length > 0 ? dbProducts : mockProducts;
  const categories = dbCategories.length > 0 ? dbCategories : mockCategories;
  
  // Check if user can manage products (pemilik or admin)
  const canManageProducts = currentUser?.role === 'pemilik' || currentUser?.role === 'admin';

  // Filter products based on search, category, and stock
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.nama.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "Semua") {
      filtered = filtered.filter(product => product.kategori === selectedCategory);
    }

    // Filter by stock status
    if (stockFilter !== "Semua") {
      filtered = filtered.filter(product => {
        if (stockFilter === "Habis") return product.stok === 0;
        if (stockFilter === "Rendah") return product.stok > 0 && product.stok <= 10;
        if (stockFilter === "Normal") return product.stok > 10;
        return true;
      });
    }

    return filtered;
  }, [products, searchTerm, selectedCategory, stockFilter]);

  // Calculate stock statistics
  const stockStats = useProductStats(products);

  const getStockStatus = (stok: number) => {
    if (stok === 0) return { label: "Habis", color: "bg-red-500" };
    if (stok <= 10) return { label: "Rendah", color: "bg-yellow-500" };
    return { label: "Normal", color: "bg-green-500" };
  };

  const handleUpdateStock = async (productId: number, newStock: number) => {
    if (!currentUser?.role) {
      alert("Role pengguna tidak ditemukan");
      return;
    }

    try {
      await updateStock({ 
        productId, 
        stok: newStock, 
        userRole: currentUser.role 
      });
    } catch (error: any) {
      alert(error.message || "Gagal mengupdate stok");
      throw error;
    }
  };

  const handleAddProduct = (newProduct: Product) => {
    // This will be handled by the AddProductModal component
    console.log("Add product:", newProduct);
  };

  const handleAddCategory = (newCategory: Category) => {
    // This will be handled by the AddCategoryModal component
    console.log("Add category:", newCategory);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (productId: number, updatedData: Partial<Product>) => {
    try {
      await updateProduct({ productId, updatedData });
      setIsEditModalOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      alert(error.message || "Gagal mengupdate produk");
      throw error;
    }
  };

  const handleBackClick = () => {
    window.history.back();
  };

  const handleFilterClick = () => {
    setShowFilterModal(true);
  };

  const resetFilters = () => {
    setSelectedCategory("Semua");
    setStockFilter("Semua");
    setShowFilterModal(false);
  };

  const applyFilters = () => {
    setShowFilterModal(false);
  };

  const handleUpgradeClick = () => {
    window.location.href = '/berlangganan';
  };

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Mobile Back Button - Only show on mobile, positioned below main header */}
      <div className="lg:hidden bg-white border-b px-4 py-2 flex items-center gap-3">
        <Button variant="ghost" size="sm" className="p-2" onClick={handleBackClick}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm text-gray-600">Kembali</span>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="flex">
          <button
            className={`flex-1 py-3 px-4 text-center border-b-2 font-medium ${
              activeTab === "Produk" 
                ? "border-red-500 text-red-500" 
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab("Produk")}
          >
            Produk
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center border-b-2 font-medium ${
              activeTab === "Kategori" 
                ? "border-red-500 text-red-500" 
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab("Kategori")}
          >
            Kategori
          </button>
        </div>
      </div>

      {/* Pro Upgrade Banner */}
      <div className="mx-4 mt-4 mb-4">
        <div className="bg-green-100 border border-green-200 rounded-lg p-3 flex items-center justify-between cursor-pointer" onClick={handleUpgradeClick}>
          <span className="text-green-800 text-sm font-medium">
            Saatnya upgrade ke Qasir Pro
          </span>
          <Button variant="ghost" size="sm" className="p-1">
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari Produk"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0" onClick={handleFilterClick}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "Produk" ? (
        <>
          {/* Stock Statistics */}
          <div className="px-4 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-white">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Total Produk</p>
                      <p className="text-lg font-semibold">{stockStats.totalProducts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-xs text-gray-500">Stok Habis</p>
                      <p className="text-lg font-semibold text-red-600">{stockStats.outOfStock}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-xs text-gray-500">Stok Rendah</p>
                      <p className="text-lg font-semibold text-yellow-600">{stockStats.lowStock}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white">
                <CardContent className="p-3">
                  <div>
                    <p className="text-xs text-gray-500">Nilai Stok</p>
                    <p className="text-sm font-semibold">Rp{stockStats.totalStockValue.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Product List */}
          <div className="px-4 space-y-3">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stok);
              return (
                <Card key={product.id} className="bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-600 font-semibold text-sm">
                          {product.avatar}
                        </span>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm mb-1">
                          {product.nama}
                        </h3>
                        <p className="text-gray-900 font-semibold text-sm mb-1">
                          Rp{product.harga.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={`${stockStatus.color} text-white text-xs px-2 py-1`}
                          >
                            {stockStatus.label}
                          </Badge>
                          <span className="text-xs text-gray-500">Stok: {product.stok}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {canManageProducts && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            className="p-2"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <EditStockModal
                            product={{
                              id: product.id,
                              nama: product.nama,
                              stok: product.stok
                            }}
                            onUpdateStock={handleUpdateStock}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Floating Add Button */}
          <div className="fixed bottom-6 right-6">
            <AddProductModal onAddProduct={handleAddProduct} />
          </div>
        </>
      ) : (
        /* Category Tab Content */
        <div className="px-4 py-8">
          {categories.length === 0 ? (
            <div className="text-center">
              <div className="text-gray-500 mb-4">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Belum ada kategori</p>
                <p className="text-xs text-gray-400 mt-1">
                  Tambahkan kategori untuk mengorganisir produk Anda
                </p>
              </div>
              <AddCategoryModal onAddCategory={handleAddCategory} />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900">Kategori Produk</h3>
                <AddCategoryModal 
                  onAddCategory={handleAddCategory}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah
                    </Button>
                  }
                />
              </div>
              
              {categories.map((category) => (
                <Card key={category.id} className="bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.warna }}
                      ></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {category.nama}
                        </h4>
                        {category.deskripsi && (
                          <p className="text-xs text-gray-500 mt-1">
                            {category.deskripsi}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {products.filter(p => p.kategori === category.nama).length} produk
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom Navigation Spacer */}
      <div className="h-20"></div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Filter Produk</h2>
              <button 
                onClick={() => setShowFilterModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="Semua">Semua Kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.nama}>
                      {category.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Stok
                </label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Normal">Stok Normal (lebih dari 10)</option>
                  <option value="Rendah">Stok Rendah (1-10)</option>
                  <option value="Habis">Stok Habis (0)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="flex-1"
              >
                Reset
              </Button>
              <Button 
                onClick={applyFilters}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                Terapkan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={handleUpdateProduct}
        isLoading={isUpdatingProduct}
      />
    </div>
  );
}
