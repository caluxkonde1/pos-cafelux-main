import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Search, Eye, CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface PendingPayment {
  id: string;
  nomorTransaksi: string;
  pelanggan: string;
  total: number;
  metodePembayaran: string;
  waktuTransaksi: string;
  status: 'pending' | 'expired' | 'processing';
  timeRemaining: number;
}

export default function MenungguPembayaran() {
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching pending payments
    const mockData: PendingPayment[] = [
      {
        id: "1",
        nomorTransaksi: "T1752132320001",
        pelanggan: "Andi Susanto",
        total: 25000,
        metodePembayaran: "QRIS",
        waktuTransaksi: "2025-07-10T15:30:00Z",
        status: 'pending',
        timeRemaining: 890
      },
      {
        id: "2", 
        nomorTransaksi: "T1752132320002",
        pelanggan: "Siti Nurhaliza",
        total: 45000,
        metodePembayaran: "E-Wallet",
        waktuTransaksi: "2025-07-10T15:25:00Z",
        status: 'processing',
        timeRemaining: 1200
      },
      {
        id: "3",
        nomorTransaksi: "T1752132320003", 
        pelanggan: "Budi Santoso",
        total: 15000,
        metodePembayaran: "Transfer Bank",
        waktuTransaksi: "2025-07-10T15:20:00Z",
        status: 'expired',
        timeRemaining: 0
      }
    ];
    
    setTimeout(() => {
      setPendingPayments(mockData);
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

  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Menunggu</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500 text-white">Diproses</Badge>;
      case 'expired':
        return <Badge className="bg-red-500 text-white">Kedaluwarsa</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">Unknown</Badge>;
    }
  };

  const filteredPayments = pendingPayments.filter(payment =>
    payment.nomorTransaksi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.pelanggan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = pendingPayments.filter(p => p.status === 'pending').length;
  const processingCount = pendingPayments.filter(p => p.status === 'processing').length;
  const expiredCount = pendingPayments.filter(p => p.status === 'expired').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menunggu Pembayaran</h1>
          <p className="text-gray-600">Kelola transaksi yang menunggu pembayaran</p>
        </div>
        <Button className="bg-red-500 hover:bg-red-600 text-white">
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Menunggu</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Diproses</p>
                <p className="text-2xl font-bold text-gray-900">{processingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Kedaluwarsa</p>
                <p className="text-2xl font-bold text-gray-900">{expiredCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Nilai</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(pendingPayments.reduce((sum, p) => sum + p.total, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembayaran Tertunda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Cari nomor transaksi atau nama pelanggan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Payments List */}
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="animate-spin mx-auto mb-4 text-gray-400" size={32} />
              <p className="text-gray-500">Memuat data pembayaran...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-500">Tidak ada pembayaran tertunda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{payment.nomorTransaksi}</h3>
                        {getStatusBadge(payment.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Pelanggan</p>
                          <p className="font-medium">{payment.pelanggan}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total</p>
                          <p className="font-medium">{formatCurrency(payment.total)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Metode</p>
                          <p className="font-medium">{payment.metodePembayaran}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Sisa Waktu</p>
                          <p className={`font-medium ${payment.timeRemaining > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                            {payment.timeRemaining > 0 ? formatTimeRemaining(payment.timeRemaining) : 'Kedaluwarsa'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye size={16} className="mr-1" />
                        Detail
                      </Button>
                      {payment.status === 'pending' && (
                        <Button className="bg-green-500 hover:bg-green-600 text-white" size="sm">
                          <CheckCircle size={16} className="mr-1" />
                          Konfirmasi
                        </Button>
                      )}
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
