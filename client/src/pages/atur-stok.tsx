import { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Search, Scan } from "lucide-react";

// Mock data untuk development
const mockProducts = [
  { 
    id: 1, 
    nama: "Kopi Americano", 
    stok: 50, 
    kategori: "Minuman",
    image: "/api/placeholder/40/40",
    barcode: "1234567890123"
  },
  { 
    id: 2, 
    nama: "Cappuccino", 
    stok: 30, 
    kategori: "Minuman",
    image: "/api/placeholder/40/40",
    barcode: "1234567890124"
  },
  { 
    id: 3, 
    nama: "Nasi Goreng", 
    stok: 20, 
    kategori: "Makanan",
    image: "/api/placeholder/40/40",
    barcode: "1234567890125"
  },
  { 
    id: 4, 
    nama: "Sandwich", 
    stok: 15, 
    kategori: "Makanan",
    image: "/api/placeholder/40/40",
    barcode: "1234567890126"
  },
  { 
    id: 5, 
    nama: "Keripik", 
    stok: 100, 
    kategori: "Snack",
    image: "/api/placeholder/40/40",
    barcode: "1234567890127"
  },
];

interface Product {
  id: number;
  nama: string;
  stok: number;
  kategori: string;
  image: string;
  barcode: string;
}

export default function AturStokPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [stockUpdates, setStockUpdates] = useState<{[key: number]: number}>({});

  useEffect(() => {
    setProducts(mockProducts);
    // Initialize stock updates with current stock values
    const initialStocks: {[key: number]: number} = {};
    mockProducts.forEach(product => {
      initialStocks[product.id] = product.stok;
    });
    setStockUpdates(initialStocks);
  }, []);

  // Filter products based on search
  const filteredProducts = products.filter(product => 
    product.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  const handleStockChange = (productId: number, newStock: number) => {
    setStockUpdates(prev => ({
      ...prev,
      [productId]: newStock
    }));
  };

  const handleScanBarcode = () => {
    // Placeholder for barcode scanning functionality
    alert("Fitur scan barcode akan segera tersedia!");
  };

  const handleSaveStock = (productId: number) => {
    // Update the product stock in the products array
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, stok: stockUpdates[productId] }
        : product
    ));
    alert(`Stok produk berhasil diperbarui!`);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => window.history.back()}
        >
          ←
        </Button>
        <h1 className="text-2xl font-bold">Atur Stok</h1>
      </div>

      {/* Search Bar with Barcode Scanner */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari Produk"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleScanBarcode}
          className="shrink-0"
        >
          <Scan className="h-4 w-4" />
        </Button>
      </div>

      {/* Product List */}
      <div className="space-y-3">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center gap-4">
                {/* Product Avatar */}
                <Avatar className="h-12 w-12">
                  <AvatarImage src={product.image} alt={product.nama} />
                  <AvatarFallback>
                    {product.nama.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{product.nama}</h3>
                  <p className="text-xs text-gray-500">{product.kategori}</p>
                  <p className="text-xs text-gray-400">Barcode: {product.barcode}</p>
                </div>

                {/* Stock Input */}
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Stok Saat Ini</p>
                    <p className="font-semibold">{product.stok}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={stockUpdates[product.id] || 0}
                      onChange={(e) => handleStockChange(product.id, parseInt(e.target.value) || 0)}
                      className="w-20 text-center"
                      min="0"
                    />
                    <Button 
                      size="sm"
                      onClick={() => handleSaveStock(product.id)}
                      disabled={stockUpdates[product.id] === product.stok}
                    >
                      Simpan
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Tidak ada produk yang ditemukan</p>
        </div>
      )}
    </div>
  );
}
