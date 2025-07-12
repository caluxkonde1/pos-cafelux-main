import { useState, useEffect, useMemo } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Search, Filter, Plus, Package, AlertTriangle, TrendingDown, DollarSign, MoreVertical, Trash2, Edit } from "lucide-react";
import { AddProductModal } from "../components/add-product-modal";
import { AddCategoryModal } from "../components/add-category-modal";
import { EditStockModal } from "../components/edit-stock-modal";
import { EditProductModal } from "../components/edit-product-modal";
import { usePermissions } from "../hooks/use-permissions";
import { useProducts, useProductStats, useProductFilter } from "../hooks/use-products";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";

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
    isUpdatingProduct,
    addCategory,
    isAddingCategory,
    deleteProduct,
    isDeletingProduct
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

  const handleDeleteProduct = async (productId: number) => {
    try {
      await deleteProduct(productId);
    } catch (error: any) {
      alert(error.message || "Gagal menghapus produk");
      throw error;
    }
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

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Tab Navigation */}
      <div className="bg-white">
        <div className="flex">
          <button
            className={`flex-1 py-4 px-4 text-center border-b-2 font-medium transition-colors ${
              activeTab === "Produk" 
                ? "border-red-500 text-red-500" 
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab("Produk")}
          >
            Produk
          </button>
          <button
            className={`flex-1 py-4 px-4 text-center border-b-2 font-medium transition-colors ${
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

      {/* Search Bar */}
      <div className="px-4 mb-4 mt-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari Produk"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200 rounded-xl h-12 text-sm"
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 rounded-xl h-12 w-12 border-gray-200" onClick={handleFilterClick}>
            <Filter className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "Produk" ? (
        <>
          {/* Stock Statistics Cards */}
          <div className="px-4 mb-6">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Card className="bg-white rounded-xl shadow-sm border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Produk</p>
                      <p className="text-2xl font-bold text-gray-900">{stockStats.totalProducts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white rounded-xl shadow-sm border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Stok Habis</p>
                      <p className="text-2xl font-bold text-gray-900">{stockStats.outOfStock}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-white rounded-xl shadow-sm border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <TrendingDown className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Stok Rendah</p>
                      <p className="text-2xl font-bold text-gray-900">{stockStats.lowStock}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white rounded-xl shadow-sm border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Nilai Stok</p>
                      <p className="text-lg font-bold text-gray-900">Rp{stockStats.totalStockValue.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Product List */}
          <div className="px-4 space-y-3 pb-24">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stok);
              return (
                <Card key={product.id} className="bg-white rounded-xl shadow-sm border-0 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Product Image/Avatar */}
                      <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 font-semibold text-sm">
                          {product.avatar || product.nama.substring(0, 2).toUpperCase()}
                        </span>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">
                          {product.nama}
                        </h3>
                        <p className="text-gray-900 font-bold text-base mb-2">
                          Rp{product.harga.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={`${stockStatus.color} text-xs px-3 py-1 rounded-full font-medium`}
                          >
                            {stockStatus.label}
                          </Badge>
                          <span className="text-sm text-gray-500">Stok: {product.stok}</span>
                        </div>
                      </div>

                      {/* Action Menu */}
                      {canManageProducts && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2 flex-shrink-0 hover:bg-gray-100 rounded-lg"
                            >
                              <MoreVertical className="h-5 w-5 text-gray-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => handleEditProduct(product)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Edit className="h-4 w-4" />
                              Edit Produk
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Hapus Produk
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus produk "{product.nama}"? 
                                    Tindakan ini tidak dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={isDeletingProduct}
                                  >
                                    {isDeletingProduct ? "Menghapus..." : "Hapus"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Floating Add Button */}
          <div className="fixed right-4 z-50" style={{ bottom: '100px' }}>
            <AddProductModal 
              onAddProduct={handleAddProduct}
              trigger={
                <Button 
                  className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-6 w-6 text-white" />
                </Button>
              }
            />
          </div>
        </>
      ) : (
        /* Category Tab Content */
        <div className="px-4 py-6 pb-24">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-6">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Belum ada kategori</p>
                <p className="text-sm text-gray-400 mt-2">
                  Tambahkan kategori untuk mengorganisir produk Anda
                </p>
              </div>
              <AddCategoryModal onAddCategory={handleAddCategory} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-gray-900 text-lg">Kategori Produk</h3>
                <AddCategoryModal 
                  onAddCategory={handleAddCategory}
                  trigger={
                    <Button variant="outline" size="sm" className="rounded-xl border-gray-200">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah
                    </Button>
                  }
                />
              </div>
              
              {categories.map((category) => (
                <Card key={category.id} className="bg-white rounded-xl shadow-sm border-0 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-5 h-5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.warna }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-base">
                          {category.nama}
                        </h4>
                        {category.deskripsi && (
                          <p className="text-sm text-gray-500 mt-1">
                            {category.deskripsi}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-gray-500 font-medium">
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Filter Produk</h2>
              <button 
                onClick={() => setShowFilterModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Kategori
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
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
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Status Stok
                </label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Normal">Stok Normal (lebih dari 10)</option>
                  <option value="Rendah">Stok Rendah (1-10)</option>
                  <option value="Habis">Stok Habis (0)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="flex-1 rounded-xl border-gray-200"
              >
                Reset
              </Button>
              <Button 
                onClick={applyFilters}
                className="flex-1 bg-red-500 hover:bg-red-600 rounded-xl"
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
