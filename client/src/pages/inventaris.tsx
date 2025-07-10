import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Archive, Plus, Search, Package, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";

interface InventoryItem {
  id: string;
  nama: string;
  kategori: string;
  lokasi: string;
  jumlah: number;
  satuan: string;
  nilaiSatuan: number;
  totalNilai: number;
  kondisi: 'baik' | 'rusak' | 'perlu_perbaikan';
  tanggalBeli: string;
  supplier: string;
  garansi?: string;
}

export default function Inventaris() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching inventory data
    const mockData: InventoryItem[] = [
      {
        id: "1",
        nama: "Mesin Kopi Espresso",
        kategori: "Peralatan Dapur",
        lokasi: "Counter Utama",
        jumlah: 1,
        satuan: "unit",
        nilaiSatuan: 15000000,
        totalNilai: 15000000,
        kondisi: 'baik',
        tanggalBeli: "2024-01-15",
        supplier: "PT Coffee Equipment",
        garansi: "2 tahun"
      },
      {
        id: "2",
        nama: "Kulkas Display",
        kategori: "Peralatan Dapur",
        lokasi: "Area Display",
        jumlah: 2,
        satuan: "unit",
        nilaiSatuan: 8000000,
        totalNilai: 16000000,
        kondisi: 'baik',
        tanggalBeli: "2024-02-20",
        supplier: "CV Elektronik Jaya"
      },
      {
        id: "3",
        nama: "Meja Kasir",
        kategori: "Furniture",
        lokasi: "Area Kasir",
        jumlah: 1,
        satuan: "unit",
        nilaiSatuan: 2500000,
        totalNilai: 2500000,
        kondisi: 'baik',
        tanggalBeli: "2023-12-10",
        supplier: "Toko Furniture Berkah"
      },
      {
        id: "4",
        nama: "Komputer Kasir",
        kategori: "Elektronik",
        lokasi: "Area Kasir",
        jumlah: 1,
        satuan: "unit",
        nilaiSatuan: 7500000,
        totalNilai: 7500000,
        kondisi: 'perlu_perbaikan',
        tanggalBeli: "2023-11-05",
        supplier: "PT Teknologi Maju",
        garansi: "1 tahun"
      }
    ];
    
    setTimeout(() => {
      setInventoryItems(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getConditionBadge = (kondisi: string) => {
    switch (kondisi) {
      case 'baik':
        return <Badge className="bg-green-500 text-white">Baik</Badge>;
      case 'rusak':
        return <Badge className="bg-red-500 text-white">Rusak</Badge>;
      case 'perlu_perbaikan':
        return <Badge className="bg-yellow-500 text-white">Perlu Perbaikan</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">Unknown</Badge>;
    }
  };

  const filteredItems = inventoryItems.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.lokasi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = inventoryItems.length;
  const totalValue = inventoryItems.reduce((sum, item) => sum + item.totalNilai, 0);
  const goodCondition = inventoryItems.filter(item => item.kondisi === 'baik').length;
  const needRepair = inventoryItems.filter(item => item.kondisi === 'perlu_perbaikan').length;

  return (
    <div className="p-6 space-y-6">
      {/* New Feature Header */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-4 text-white mb-6">
        <div className="flex items-center space-x-3">
          <Archive size={24} />
          <div>
            <h2 className="font-bold">Fitur Baru - Inventaris</h2>
            <p className="text-sm opacity-90">Kelola aset dan inventaris bisnis Anda</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventaris</h1>
          <p className="text-gray-600">Kelola aset dan peralatan bisnis Anda</p>
        </div>
        <Button className="bg-red-500 hover:bg-red-600 text-white">
          <Plus size={16} className="mr-2" />
          Tambah Item
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Item</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Nilai</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Kondisi Baik</p>
                <p className="text-2xl font-bold text-gray-900">{goodCondition}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Perlu Perbaikan</p>
                <p className="text-2xl font-bold text-gray-900">{needRepair}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Inventaris</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Cari item inventaris..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Archive className="animate-pulse mx-auto mb-4 text-gray-400" size={32} />
              <p className="text-gray-500">Memuat data inventaris...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <Archive className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-500">Tidak ada item inventaris ditemukan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{item.nama}</h3>
                        {getConditionBadge(item.kondisi)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Kategori</p>
                          <p className="font-medium">{item.kategori}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Lokasi</p>
                          <p className="font-medium">{item.lokasi}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Jumlah</p>
                          <p className="font-medium">{item.jumlah} {item.satuan}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Nilai Satuan</p>
                          <p className="font-medium">{formatCurrency(item.nilaiSatuan)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Nilai</p>
                          <p className="font-medium text-green-600">{formatCurrency(item.totalNilai)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tanggal Beli</p>
                          <p className="font-medium">{new Date(item.tanggalBeli).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Supplier: {item.supplier}
                        {item.garansi && ` • Garansi: ${item.garansi}`}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Detail
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
