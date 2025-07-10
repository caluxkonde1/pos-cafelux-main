import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Package, TrendingDown, TrendingUp, AlertTriangle, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  nama: string;
  kode: string;
  stok: number;
  stokMinimal: number;
  satuan: string;
  harga: string;
}

interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  type: string;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  reason: string;
  catatan: string;
  createdAt: string;
  userName: string;
}

export default function StokPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentData, setAdjustmentData] = useState({
    type: "adjustment",
    quantity: "",
    reason: "manual_adjustment",
    catatan: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const productsRes = await fetch("/api/products");
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
        
        // Filter low stock products
        const lowStock = productsData.filter((p: Product) => p.stok <= p.stokMinimal);
        setLowStockProducts(lowStock);
      }

      // Fetch stock movements
      const movementsRes = await fetch("/api/stock-movements");
      if (movementsRes.ok) {
        const movementsData = await movementsRes.json();
        setStockMovements(movementsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Gagal mengambil data stok",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustment = async () => {
    if (!selectedProduct || !adjustmentData.quantity) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua data",
        variant: "destructive",
      });
      return;
    }

    try {
      const quantity = parseInt(adjustmentData.quantity);
      const newStock = selectedProduct.stok + quantity;

      const response = await fetch("/api/stock-movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          type: adjustmentData.type,
          quantity: Math.abs(quantity),
          quantityBefore: selectedProduct.stok,
          quantityAfter: newStock,
          reason: adjustmentData.reason,
          catatan: adjustmentData.catatan,
          userId: 1, // Should come from auth context
        }),
      });

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Penyesuaian stok berhasil disimpan",
        });
        
        // Reset form
        setSelectedProduct(null);
        setAdjustmentData({
          type: "adjustment",
          quantity: "",
          reason: "manual_adjustment",
          catatan: ""
        });
        
        // Refresh data
        fetchData();
      } else {
        throw new Error("Failed to save stock adjustment");
      }
    } catch (error) {
      console.error("Error saving stock adjustment:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan penyesuaian stok",
        variant: "destructive",
      });
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "in":
      case "adjustment":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "out":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-blue-600" />;
    }
  };

  const getMovementBadge = (type: string) => {
    const variants = {
      in: "bg-green-100 text-green-800",
      out: "bg-red-100 text-red-800",
      adjustment: "bg-blue-100 text-blue-800",
      transfer: "bg-purple-100 text-purple-800"
    };
    
    const labels = {
      in: "Masuk",
      out: "Keluar", 
      adjustment: "Penyesuaian",
      transfer: "Transfer"
    };

    return (
      <Badge className={variants[type as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const filteredProducts = products.filter(product =>
    product.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.kode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-qasir-red mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat data stok...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-qasir-text">Manajemen Stok</h1>
          <p className="text-qasir-text-light">Kelola inventori dan pergerakan stok</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-qasir-red hover:bg-red-600">
              <Plus className="h-4 w-4 mr-2" />
              Penyesuaian Stok
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Penyesuaian Stok</DialogTitle>
              <DialogDescription>
                Lakukan penyesuaian stok untuk produk yang dipilih
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="product">Produk</Label>
                <Select onValueChange={(value) => {
                  const product = products.find(p => p.id === parseInt(value));
                  setSelectedProduct(product || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih produk" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.nama} (Stok: {product.stok})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProduct && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Stok saat ini: <span className="font-semibold">{selectedProduct.stok} {selectedProduct.satuan}</span></p>
                </div>
              )}

              <div>
                <Label htmlFor="quantity">Jumlah Penyesuaian</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Masukkan jumlah (+ untuk tambah, - untuk kurang)"
                  value={adjustmentData.quantity}
                  onChange={(e) => setAdjustmentData(prev => ({ ...prev, quantity: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="reason">Alasan</Label>
                <Select value={adjustmentData.reason} onValueChange={(value) => setAdjustmentData(prev => ({ ...prev, reason: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual_adjustment">Penyesuaian Manual</SelectItem>
                    <SelectItem value="inventory_count">Hasil Inventarisasi</SelectItem>
                    <SelectItem value="damaged_goods">Barang Rusak</SelectItem>
                    <SelectItem value="expired_goods">Barang Kadaluarsa</SelectItem>
                    <SelectItem value="lost_goods">Barang Hilang</SelectItem>
                    <SelectItem value="supplier_return">Retur Supplier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="catatan">Catatan</Label>
                <Textarea
                  id="catatan"
                  placeholder="Catatan tambahan (opsional)"
                  value={adjustmentData.catatan}
                  onChange={(e) => setAdjustmentData(prev => ({ ...prev, catatan: e.target.value }))}
                />
              </div>

              <Button onClick={handleStockAdjustment} className="w-full bg-qasir-red hover:bg-red-600">
                Simpan Penyesuaian
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Produk aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Menipis</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">Perlu perhatian</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pergerakan Hari Ini</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockMovements.length}</div>
            <p className="text-xs text-muted-foreground">Transaksi stok</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nilai Inventori</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {products.reduce((total, product) => total + (parseFloat(product.harga) * product.stok), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total nilai stok</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Peringatan Stok Menipis
            </CardTitle>
            <CardDescription className="text-orange-700">
              {lowStockProducts.length} produk memiliki stok di bawah batas minimum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="bg-white p-3 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-sm">{product.nama}</h4>
                  <p className="text-xs text-gray-600">{product.kode}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-sm">
                      Stok: <span className="font-semibold text-orange-600">{product.stok}</span>
                    </span>
                    <span className="text-xs text-gray-500">
                      Min: {product.stokMinimal}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Levels Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Level Stok Produk</CardTitle>
              <CardDescription>Pantau level stok semua produk</CardDescription>
            </div>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Stok Saat Ini</TableHead>
                <TableHead>Stok Minimal</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Nilai Stok</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.nama}</TableCell>
                  <TableCell>{product.kode}</TableCell>
                  <TableCell>{product.stok}</TableCell>
                  <TableCell>{product.stokMinimal}</TableCell>
                  <TableCell>{product.satuan}</TableCell>
                  <TableCell>
                    {product.stok <= product.stokMinimal ? (
                      <Badge className="bg-orange-100 text-orange-800">Menipis</Badge>
                    ) : product.stok <= product.stokMinimal * 2 ? (
                      <Badge className="bg-yellow-100 text-yellow-800">Perhatian</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">Aman</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    Rp {(parseFloat(product.harga) * product.stok).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Stock Movements History */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pergerakan Stok</CardTitle>
          <CardDescription>Lacak semua perubahan stok produk</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Sebelum</TableHead>
                <TableHead>Sesudah</TableHead>
                <TableHead>Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockMovements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Belum ada pergerakan stok
                  </TableCell>
                </TableRow>
              ) : (
                stockMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      {new Date(movement.createdAt).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="font-medium">{movement.productName}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getMovementIcon(movement.type)}
                        {getMovementBadge(movement.type)}
                      </div>
                    </TableCell>
                    <TableCell>{movement.quantity}</TableCell>
                    <TableCell>{movement.quantityBefore}</TableCell>
                    <TableCell>{movement.quantityAfter}</TableCell>
                    <TableCell className="max-w-xs truncate">{movement.catatan || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
