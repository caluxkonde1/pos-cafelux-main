import { useState, useEffect, useMemo } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Search, Filter, ArrowLeft, Plus, Package, AlertTriangle, TrendingDown, DollarSign, Bell, MoreVertical } from "lucide-react";
import { AddProductModal } from "../components/add-product-modal";
import { AddCategoryModal } from "../components/add-category-modal";
import { EditStockModal } from "../components/edit-stock-modal";
import { EditProductModal } from "../components/edit-product-modal";
import { usePermissions } from "../hooks/use-permissions";
import { useProducts, useProductStats, useProductFilter } from "../hooks/use-products";

// Mock data sebagai fallback
const mockProducts = [
  { id: 1, nama: "Roti Tawar Sari Roti", harga: 8500, stok: 50, kategori: "Makanan", avatar: "RT", kode: "PRD-001" },
  { id: 2, nama: "cctv ezviz ip camera", harga: 625000, stok: 25, kategori: "Elektronik", avatar: "CE", kode: "PRD-002" },
  { id: 3, nama: "colokan listrik / steker", harga: 25000, stok: 5, kategori: "Produk", avatar: "CL", kode: "PRD-003" },
  { id: 4, nama: "jasa instalasi", harga: 125000, stok: 9994, kategori: "Produk", avatar: "JI", kode: "PRD-004" },
  { id: 5, nama: "kabel lan", harga: 9000, stok: 0, kategori: "Produk", avatar: "KL", kode: "PRD-005" },
  { id: 6, nama: "kabel listrik", harga: 15000, stok: 8, kategori: "Elektronik", avatar: "KL", kode: "PRD-006" },
  { id: 7, nama: "Microsd sandisk extreme", harga: 350000, stok: 3, kategori: "Elektronik", avatar: "MS", kode: "PRD-007" },
  { id: 8, nama: "Router wifi", harga: 450000, stok: 12, kategori: "Elektronik", avatar: "RW", kode: "PRD-008" },
];

const mockCategories = [
  { id: 1, nama: "Makanan", sort_order: 1, warna: "#ef4444", deskripsi: "" },
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
  kode?: string;
}

interface Category {
  id: number;
  nama: string;
  deskripsi?: string;
  warna?: string;
  sort_order: number;
}

export default function ProdukMobileNew() {
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
    isUpdatingProduct,
    addCategory,
    isAddingCategory
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
    if (stok === 0) return { label: "Habis", color: "bg-red-100 text-red-800" };
    if (stok <= 10) return { label: "Rendah", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Normal", color: "bg-green-100 text-green-800" };
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

  const handleAddCategory = async (newCategory: Category) => {
    try {
      await addCategory({
        nama: newCategory.nama,
        deskripsi: newCategory.deskripsi,
        warna: newCategory.warna
      });
      // Categories will be automatically refreshed by the mutation
    } catch (error: any) {
      console.error("Failed to add category:", error);
      alert(error.message || "Gagal menambahkan kategori");
    }
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
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="p-2" onClick={handleBackClick}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Kelola Produk</h1>
        </div>
        <div className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            3
          </div>
        </div>
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
          <ArrowLeft className="h-4 w-4 rotate-180 text-green-800" />
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
              className="pl-10 bg-white border-gray-200 rounded-lg"
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 rounded-lg" onClick={handleFilterClick}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "Produk" ? (
        <>
          {/* Stock Statistics Cards */}
          <div className="px-4 mb-4">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Card className="bg-white rounded-lg shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Produk</p>
                      <p className="text-xl font-bold text-gray-900">{stockStats.totalProducts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white rounded-lg shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Stok Habis</p>
                      <p className="text-xl font-bold text-gray-900">{stockStats.outOfStock}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-white rounded-lg shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <TrendingDown className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Stok Rendah</p>
                      <p className="text-xl font-bold text-gray-900">{stockStats.lowStock}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white rounded-lg shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nilai Stok</p>
                      <p className="text-sm font-bold text-gray-900">Rp{stockStats.totalStockValue.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Product List */}
          <div className="px-4 space-y-3 pb-20">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stok);
              return (
                <Card key={product.id} className="bg-white rounded-lg shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Product Image/Avatar */}
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 font-semibold text-sm">
                          {product.avatar || product.nama.substring(0, 2).toUpperCase()}
                        </span>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                          {product.nama}
                        </h3>
                        <p className="text-gray-900 font-semibold text-sm mb-2">
                          Rp{product.harga.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={`${stockStatus.color} text-xs px-2 py-1 rounded-md`}
                          >
                            {stockStatus.label}
                          </Badge>
                          <span className="text-xs text-gray-500">Stok: {product.stok}</span>
                        </div>
                      </div>

                      {/* Action Menu */}
                      {canManageProducts && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          className="p-2 flex-shrink-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Floating Add Button */}
          <div className="fixed bottom-6 right-6 z-50">
            <AddProductModal 
              onAddProduct={handleAddProduct}
              trigger={
                <Button className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 shadow-lg">
                  <Plus className="h-6 w-6 text-white" />
                </Button>
              }
            />
          </div>
        </>
      ) : (
        /* Category Tab Content */
        <div className="px-4 py-8 pb-20">
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
                    <Button variant="outline" size="sm" className="rounded-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah
                    </Button>
                  }
                />
              </div>
              
              {categories.map((category) => (
                <Card key={category.id} className="bg-white rounded-lg shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.warna }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {category.nama}
                        </h4>
                        {category.deskripsi && (
                          <p className="text-xs text-gray-500 mt-1">
                            {category.deskripsi}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
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
