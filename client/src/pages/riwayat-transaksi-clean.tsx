import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Search, Eye, Download, Calendar, TrendingUp, DollarSign, Printer, Edit } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface Transaction {
  id: number;
  nomorTransaksi: string;
  total: string;
  subtotal: string;
  pajak: string;
  diskon: string;
  status: string;
  metodePembayaran: string;
  createdAt: string;
  customer?: {
    nama: string;
  };
  kasir: {
    nama: string;
  };
  items: TransactionItem[];
}

interface TransactionItem {
  namaProduk: string;
  harga: string;
  jumlah: number;
  subtotal: string;
}

export default function RiwayatTransaksiClean() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: ""
  });

  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", dateFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFilter.startDate) params.append('startDate', dateFilter.startDate);
      if (dateFilter.endDate) params.append('endDate', dateFilter.endDate);
      
      const response = await fetch(`/api/transactions?${params}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    }
  });

  // Helper functions for transaction operations
  const handleViewDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailModalOpen(true);
  };

  const handlePrintInvoice = async (transactionId: number) => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}/print`, {
        method: 'POST'
      });
      if (response.ok) {
        await queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
        window.print();
      }
    } catch (error) {
      console.error('Print error:', error);
      alert('Gagal mencetak invoice');
    }
  };

  const handleExportTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (dateFilter.startDate) params.append('startDate', dateFilter.startDate);
      if (dateFilter.endDate) params.append('endDate', dateFilter.endDate);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/transactions/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `riwayat-transaksi-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal mengexport data');
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Selesai</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Dibatalkan</Badge>;
      case 'refund':
        return <Badge className="bg-orange-100 text-orange-800">Refund</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'tunai':
        return 'Tunai';
      case 'kartu':
        return 'Kartu';
      case 'ewallet':
        return 'E-Wallet';
      case 'qris':
        return 'QRIS';
      default:
        return method;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Baru saja';
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} hari yang lalu`;
    
    return date.toLocaleDateString('id-ID');
  };

  const filteredTransactions = transactions.filter((transaction: Transaction) => {
    const matchesSearch = 
      transaction.nomorTransaksi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customer?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.kasir.nama.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalTransaksi = transactions.length;
  const totalNilai = transactions.reduce((sum: number, t: Transaction) => sum + parseFloat(t.total), 0);
  const transaksiSelesai = transactions.filter((t: Transaction) => t.status === 'completed').length;
  const transaksiDibatalkan = transactions.filter((t: Transaction) => t.status === 'cancelled').length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Riwayat Transaksi</h1>
        <p className="text-gray-600">Kelola dan pantau semua transaksi yang telah dilakukan</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Transaksi</p>
                <p className="text-2xl font-bold text-gray-900">{totalTransaksi}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <History className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Nilai</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalNilai)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Selesai</p>
                <p className="text-2xl font-bold text-gray-900">{transaksiSelesai}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Dibatalkan</p>
                <p className="text-2xl font-bold text-gray-900">{transaksiDibatalkan}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-red-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-xl font-bold text-gray-900">Daftar Transaksi</CardTitle>
            <Button 
              variant="outline"
              onClick={handleExportTransactions}
            >
              <Download className="mr-2" size={16} />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nomor transaksi, pelanggan, atau kasir..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Transaksi</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Kasir</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Pembayaran</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-gray-500">
                        <History className="mx-auto mb-2" size={32} />
                        <p>Tidak ada transaksi ditemukan</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.nomorTransaksi}</TableCell>
                      <TableCell>{formatTimeAgo(transaction.createdAt)}</TableCell>
                      <TableCell>{transaction.customer?.nama || "Umum"}</TableCell>
                      <TableCell>{transaction.kasir.nama}</TableCell>
                      <TableCell>{transaction.items.length} item</TableCell>
                      <TableCell>{getPaymentMethodLabel(transaction.metodePembayaran)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(transaction.total)}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewDetail(transaction)}
                            title="Lihat Detail"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handlePrintInvoice(transaction.id)}
                            title="Cetak Invoice"
                          >
                            <Printer size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            title="Edit Transaksi (Admin)"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nomor Transaksi</p>
                  <p className="font-semibold">{selectedTransaction.nomorTransaksi}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tanggal</p>
                  <p className="font-semibold">
                    {new Date(selectedTransaction.createdAt).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kasir</p>
                  <p className="font-semibold">{selectedTransaction.kasir.nama}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pelanggan</p>
                  <p className="font-semibold">{selectedTransaction.customer?.nama || "Umum"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Metode Pembayaran</p>
                  <p className="font-semibold">{getPaymentMethodLabel(selectedTransaction.metodePembayaran)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div>{getStatusBadge(selectedTransaction.status)}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Item Transaksi</h4>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produk</TableHead>
                        <TableHead>Harga</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTransaction.items.map((item: TransactionItem, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{item.namaProduk}</TableCell>
                          <TableCell>{formatCurrency(item.harga)}</TableCell>
                          <TableCell>{item.jumlah}</TableCell>
                          <TableCell>{formatCurrency(item.subtotal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedTransaction.subtotal)}</span>
                </div>
                {parseFloat(selectedTransaction.pajak) > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span>Pajak:</span>
                    <span>{formatCurrency(selectedTransaction.pajak)}</span>
                  </div>
                )}
                {parseFloat(selectedTransaction.diskon) > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span>Diskon:</span>
                    <span>-{formatCurrency(selectedTransaction.diskon)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedTransaction.total)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => handlePrintInvoice(selectedTransaction.id)}
                  className="flex-1"
                >
                  <Printer className="mr-2" size={16} />
                  Cetak Invoice
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setDetailModalOpen(false)}
                  className="flex-1"
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
