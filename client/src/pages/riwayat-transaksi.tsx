import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, Search, Eye, Download, Filter, Calendar, TrendingUp, DollarSign } from "lucide-react";

interface Transaction {
  id: string;
  nomorTransaksi: string;
  tanggal: string;
  waktu: string;
  pelanggan: string;
  total: number;
  metodePembayaran: string;
  status: 'selesai' | 'dibatalkan' | 'refund';
  kasir: string;
  items: number;
}

export default function RiwayatTransaksi() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [dateFilter, setDateFilter] = useState("hari-ini");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching transaction history
    const mockData: Transaction[] = [
      {
        id: "1",
        nomorTransaksi: "T1752132320001",
        tanggal: "2025-07-10",
        waktu: "15:30:22",
        pelanggan: "Andi Susanto",
        total: 25000,
        metodePembayaran: "Tunai",
        status: 'selesai',
        kasir: "Siti Nurhaliza",
        items: 3
      },
      {
        id: "2",
        nomorTransaksi: "T1752132320002",
        tanggal: "2025-07-10",
        waktu: "14:15:10",
        pelanggan: "Budi Santoso",
        total: 45000,
        metodePembayaran: "QRIS",
        status: 'selesai',
        kasir: "Andi Susanto",
        items: 5
      },
      {
        id: "3",
        nomorTransaksi: "T1752132320003",
        tanggal: "2025-07-10",
        waktu: "13:45:33",
        pelanggan: "Dewi Sartika",
        total: 15000,
        metodePembayaran: "E-Wallet",
        status: 'dibatalkan',
        kasir: "Siti Nurhaliza",
        items: 2
      },
      {
        id: "4",
        nomorTransaksi: "T1752132320004",
        tanggal: "2025-07-09",
        waktu: "16:20:15",
        pelanggan: "Ahmad Fauzi",
        total: 35000,
        metodePembayaran: "Kartu Debit",
        status: 'selesai',
        kasir: "Andi Susanto",
        items: 4
      },
      {
        id: "5",
        nomorTransaksi: "T1752132320005",
        tanggal: "2025-07-09",
        waktu: "11:30:45",
        pelanggan: "Lisa Permata",
        total: 28000,
        metodePembayaran: "Tunai",
        status: 'refund',
        kasir: "Siti Nurhaliza",
        items: 3
      }
    ];
    
    setTimeout(() => {
      setTransactions(mockData);
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
      case 'selesai':
        return <Badge className="bg-green-500 text-white">Selesai</Badge>;
      case 'dibatalkan':
        return <Badge className="bg-red-500 text-white">Dibatalkan</Badge>;
      case 'refund':
        return <Badge className="bg-orange-500 text-white">Refund</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">Unknown</Badge>;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.nomorTransaksi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.pelanggan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.kasir.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "semua" || transaction.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter === "hari-ini") {
      matchesDate = transaction.tanggal === "2025-07-10";
    } else if (dateFilter === "kemarin") {
      matchesDate = transaction.tanggal === "2025-07-09";
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalTransaksi = filteredTransactions.length;
  const totalNilai = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  const transaksiSelesai = filteredTransactions.filter(t => t.status === 'selesai').length;
  const transaksiDibatalkan = filteredTransactions.filter(t => t.status === 'dibatalkan').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
          <p className="text-gray-600">Kelola dan pantau semua transaksi yang telah dilakukan</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button className="bg-red-500 hover:bg-red-600 text-white">
            <Filter size={16} className="mr-2" />
            Filter Lanjutan
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <History className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Transaksi</p>
                <p className="text-2xl font-bold text-gray-900">{totalTransaksi}</p>
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
                <p className="text-lg font-bold text-gray-900">{formatCurrency(totalNilai)}</p>
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
                <p className="text-sm text-gray-600">Selesai</p>
                <p className="text-2xl font-bold text-gray-900">{transaksiSelesai}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Dibatalkan</p>
                <p className="text-2xl font-bold text-gray-900">{transaksiDibatalkan}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Cari nomor transaksi, pelanggan, atau kasir..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Status</SelectItem>
                <SelectItem value="selesai">Selesai</SelectItem>
                <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tanggal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hari-ini">Hari Ini</SelectItem>
                <SelectItem value="kemarin">Kemarin</SelectItem>
                <SelectItem value="minggu-ini">Minggu Ini</SelectItem>
                <SelectItem value="bulan-ini">Bulan Ini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transaction List */}
          {loading ? (
            <div className="text-center py-8">
              <History className="animate-spin mx-auto mb-4 text-gray-400" size={32} />
              <p className="text-gray-500">Memuat riwayat transaksi...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <History className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-500">Tidak ada transaksi ditemukan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{transaction.nomorTransaksi}</h3>
                        {getStatusBadge(transaction.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Tanggal</p>
                          <p className="font-medium">{new Date(transaction.tanggal).toLocaleDateString('id-ID')}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Waktu</p>
                          <p className="font-medium">{transaction.waktu}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Pelanggan</p>
                          <p className="font-medium">{transaction.pelanggan}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total</p>
                          <p className="font-medium text-green-600">{formatCurrency(transaction.total)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Pembayaran</p>
                          <p className="font-medium">{transaction.metodePembayaran}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Kasir</p>
                          <p className="font-medium">{transaction.kasir}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye size={16} className="mr-1" />
                        Detail
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download size={16} className="mr-1" />
                        Cetak
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
