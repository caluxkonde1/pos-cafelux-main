import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Utensils, Plus, Users, Clock, CheckCircle, XCircle } from "lucide-react";

interface Table {
  id: string;
  nomor: string;
  nama: string;
  kapasitas: number;
  lokasi: string;
  status: 'tersedia' | 'terisi' | 'reserved' | 'maintenance';
  pelanggan?: string;
  waktuMulai?: string;
  estimasiSelesai?: string;
  totalBill?: number;
}

export default function PengaturanMeja() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching table data
    const mockData: Table[] = [
      {
        id: "1",
        nomor: "01",
        nama: "Meja VIP 1",
        kapasitas: 4,
        lokasi: "Area VIP",
        status: 'terisi',
        pelanggan: "Andi Susanto",
        waktuMulai: "14:30",
        estimasiSelesai: "16:00",
        totalBill: 125000
      },
      {
        id: "2",
        nomor: "02",
        nama: "Meja Regular 1",
        kapasitas: 2,
        lokasi: "Area Utama",
        status: 'tersedia'
      },
      {
        id: "3",
        nomor: "03",
        nama: "Meja Regular 2",
        kapasitas: 4,
        lokasi: "Area Utama",
        status: 'reserved',
        pelanggan: "Siti Nurhaliza",
        waktuMulai: "15:00"
      },
      {
        id: "4",
        nomor: "04",
        nama: "Meja Outdoor 1",
        kapasitas: 6,
        lokasi: "Area Outdoor",
        status: 'tersedia'
      },
      {
        id: "5",
        nomor: "05",
        nama: "Meja Bar 1",
        kapasitas: 2,
        lokasi: "Area Bar",
        status: 'maintenance'
      },
      {
        id: "6",
        nomor: "06",
        nama: "Meja Regular 3",
        kapasitas: 4,
        lokasi: "Area Utama",
        status: 'terisi',
        pelanggan: "Budi Santoso",
        waktuMulai: "13:45",
        estimasiSelesai: "15:30",
        totalBill: 85000
      }
    ];
    
    setTimeout(() => {
      setTables(mockData);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'tersedia':
        return <Badge className="bg-green-500 text-white">Tersedia</Badge>;
      case 'terisi':
        return <Badge className="bg-red-500 text-white">Terisi</Badge>;
      case 'reserved':
        return <Badge className="bg-yellow-500 text-white">Reserved</Badge>;
      case 'maintenance':
        return <Badge className="bg-gray-500 text-white">Maintenance</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'tersedia':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'terisi':
        return <Users className="text-red-500" size={20} />;
      case 'reserved':
        return <Clock className="text-yellow-500" size={20} />;
      case 'maintenance':
        return <XCircle className="text-gray-500" size={20} />;
      default:
        return <Utensils className="text-gray-500" size={20} />;
    }
  };

  const tersediaCount = tables.filter(t => t.status === 'tersedia').length;
  const terisiCount = tables.filter(t => t.status === 'terisi').length;
  const reservedCount = tables.filter(t => t.status === 'reserved').length;
  const totalRevenue = tables
    .filter(t => t.totalBill)
    .reduce((sum, t) => sum + (t.totalBill || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Meja</h1>
          <p className="text-gray-600">Kelola meja dan reservasi restoran/cafe</p>
        </div>
        <Button className="bg-red-500 hover:bg-red-600 text-white">
          <Plus size={16} className="mr-2" />
          Tambah Meja
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tersedia</p>
                <p className="text-2xl font-bold text-gray-900">{tersediaCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Users className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Terisi</p>
                <p className="text-2xl font-bold text-gray-900">{terisiCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Reserved</p>
                <p className="text-2xl font-bold text-gray-900">{reservedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Utensils className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenue Aktif</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Layout */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Meja</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Utensils className="animate-pulse mx-auto mb-4 text-gray-400" size={32} />
              <p className="text-gray-500">Memuat data meja...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((table) => (
                <Card key={table.id} className={`cursor-pointer transition-all hover:shadow-md ${
                  table.status === 'tersedia' ? 'border-green-200 bg-green-50' :
                  table.status === 'terisi' ? 'border-red-200 bg-red-50' :
                  table.status === 'reserved' ? 'border-yellow-200 bg-yellow-50' :
                  'border-gray-200 bg-gray-50'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(table.status)}
                        <div>
                          <h3 className="font-semibold text-gray-900">Meja {table.nomor}</h3>
                          <p className="text-sm text-gray-600">{table.nama}</p>
                        </div>
                      </div>
                      {getStatusBadge(table.status)}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Kapasitas:</span>
                        <span className="font-medium">{table.kapasitas} orang</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Lokasi:</span>
                        <span className="font-medium">{table.lokasi}</span>
                      </div>
                      
                      {table.pelanggan && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Pelanggan:</span>
                            <span className="font-medium">{table.pelanggan}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Mulai:</span>
                            <span className="font-medium">{table.waktuMulai}</span>
                          </div>
                          {table.estimasiSelesai && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Estimasi:</span>
                              <span className="font-medium">{table.estimasiSelesai}</span>
                            </div>
                          )}
                          {table.totalBill && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Bill:</span>
                              <span className="font-medium text-green-600">{formatCurrency(table.totalBill)}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      {table.status === 'tersedia' && (
                        <Button size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
                          Reservasi
                        </Button>
                      )}
                      {table.status === 'terisi' && (
                        <Button size="sm" className="flex-1 bg-green-500 hover:bg-green-600 text-white">
                          Checkout
                        </Button>
                      )}
                      {table.status === 'reserved' && (
                        <Button size="sm" className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white">
                          Check In
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Plus className="mx-auto mb-3 text-blue-500" size={32} />
            <h3 className="font-semibold mb-2">Tambah Meja</h3>
            <p className="text-sm text-gray-600">Tambah meja baru ke layout</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Clock className="mx-auto mb-3 text-yellow-500" size={32} />
            <h3 className="font-semibold mb-2">Kelola Reservasi</h3>
            <p className="text-sm text-gray-600">Atur jadwal reservasi</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Utensils className="mx-auto mb-3 text-green-500" size={32} />
            <h3 className="font-semibold mb-2">Layout Designer</h3>
            <p className="text-sm text-gray-600">Desain ulang layout meja</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
