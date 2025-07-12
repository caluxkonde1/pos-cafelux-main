import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScanBarcode, Search, Filter, Download, Eye, Receipt, Edit, Printer, Calendar, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import POSModal from "@/components/pos-modal";
import type { TransactionWithItems } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { usePermissions } from "@/hooks/use-permissions";

export default function Penjualan() {
  const [posModalOpen, setPosModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithItems | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: ""
  });

  const queryClient = useQueryClient();
  const { currentUser } = usePermissions();
  
  // Check if user can edit transactions (admin, supervisor, pemilik)
  const canEditTransactions = currentUser?.role === 'admin' || 
                              currentUser?.role === 'supervisor' || 
                              currentUser?.role === 'pemilik';

  const { data: transactions = [], isLoading } = useQuery<TransactionWithItems[]>({
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
        return <Badge className="bg-green-100 text-green-800">Berhasil</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Dibatalkan</Badge>;
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

  // Helper functions for transaction operations
  const handleViewDetail = (transaction: TransactionWithItems) => {
    setSelectedTransaction(transaction);
    setDetailModalOpen(true);
  };

  const handlePrintInvoice = async (transactionId: number) => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}/print`, {
        method: 'POST'
      });
      if (response.ok) {
        // Mark as printed and trigger print
        await queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
        window.print(); // Simple print for now
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
      if (searchQuery) params.append('search', searchQuery);
      
      // Create CSV content from filtered transactions
      const csvContent = generateCSV(filteredTransactions);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transaksi-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert('Data berhasil diexport!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal mengexport data');
    }
  };

  const generateCSV = (data: TransactionWithItems[]) => {
    const headers = [
      'No. Transaksi',
      'Tanggal',
      'Waktu', 
      'Kasir',
      'Pelanggan',
      'Items',
      'Metode Pembayaran',
      'Subtotal',
      'Pajak',
      'Diskon',
      'Total',
      'Status'
    ];
    
    const csvRows = [
      headers.join(','),
      ...data.map(transaction => [
        transaction.nomorTransaksi,
        new Date(transaction.createdAt).toLocaleDateString('id-ID'),
        new Date(transaction.createdAt).toLocaleTimeString('id-ID'),
        transaction.kasir.nama,
        transaction.customer?.nama || 'Umum',
        transaction.items.length,
        getPaymentMethodLabel(transaction.metodePembayaran),
        transaction.subtotal,
        transaction.pajak,
        transaction.diskon,
        transaction.total,
        transaction.status
      ].join(','))
    ];
    
    return csvRows.join('\n');
  };

  const handleApplyDateFilter = () => {
    setFilterModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
  };

  const handleEditTransaction = (transaction: TransactionWithItems) => {
    if (!canEditTransactions) {
      alert('Anda tidak memiliki akses untuk mengedit transaksi');
      return;
    }
    setSelectedTransaction(transaction);
    setEditModalOpen(true);
  };

  const handleUpdateTransaction = async (updatedData: Partial<TransactionWithItems>) => {
    if (!selectedTransaction) return;
    
    try {
      const response = await fetch(`/api/transactions/${selectedTransaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (response.ok) {
        await queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
        setEditModalOpen(false);
        setSelectedTransaction(null);
        alert('Transaksi berhasil diupdate!');
      } else {
        throw new Error('Failed to update transaction');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Gagal mengupdate transaksi');
    }
  };

  const resetFilters = () => {
    setDateFilter({ startDate: "", endDate: "" });
    setStatusFilter("all");
    setSearchQuery("");
    setFilterModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
  };

  const filteredTransactions = (transactions as TransactionWithItems[]).filter((transaction: TransactionWithItems) => {
    const matchesSearch = 
      transaction.nomorTransaksi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customer?.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.kasir.nama.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPenjualan = (transactions as TransactionWithItems[]).reduce((sum: number, t: TransactionWithItems) => sum + parseFloat(t.total), 0);
  const totalTransaksi = (transactions as TransactionWithItems[]).length;
  const transaksiHariIni = (transactions as TransactionWithItems[]).filter((t: TransactionWithItems) => {
    const today = new Date();
    const transactionDate = new Date(t.createdAt);
    return transactionDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Penjualan</h1>
          <p className="text-gray-600">Kelola transaksi penjualan dan riwayat pembayaran</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Penjualan</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPenjualan)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Receipt className="text-green-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Transaksi</p>
                <p className="text-2xl font-bold text-gray-900">{totalTransaksi}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ScanBarcode className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Transaksi Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900">{transaksiHariIni}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Receipt className="text-purple-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-xl font-bold text-gray-900">Riwayat Transaksi</CardTitle>
            <Button 
              className="bg-red-500 hover:bg-red-600"
              onClick={() => setPosModalOpen(true)}
            >
              <ScanBarcode className="mr-2" size={16} />
              Transaksi Baru
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="completed">Berhasil</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setFilterModalOpen(true)}>
              <Filter className="mr-2" size={16} />
              Filter
            </Button>
            <Button variant="outline" onClick={handleExportTransactions}>
              <Download className="mr-2" size={16} />
              Export
            </Button>
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
                        <Receipt className="mx-auto mb-2" size={32} />
                        <p>Tidak ada transaksi ditemukan</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.nomorTransaksi}</TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(transaction.createdAt), { 
                          addSuffix: true, 
                          locale: id 
                        })}
                      </TableCell>
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
                          {/* Edit button for admin only */}
                          {canEditTransactions && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditTransaction(transaction)}
                              title="Edit Transaksi (Admin)"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit size={16} />
                            </Button>
                          )}
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

      {/* POS Modal */}
      <POSModal open={posModalOpen} onOpenChange={setPosModalOpen} />

      {/* Filter Modal */}
      <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter Transaksi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                id="startDate"
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Tanggal Akhir</Label>
              <Input
                id="endDate"
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
            <Button onClick={handleApplyDateFilter}>
              Terapkan Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                      {selectedTransaction.items.map((item, index) => (
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

      {/* Edit Transaction Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Transaksi</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Status Transaksi</Label>
                <Select 
                  value={selectedTransaction.status} 
                  onValueChange={(value) => setSelectedTransaction({...selectedTransaction, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Berhasil</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Metode Pembayaran</Label>
                <Select 
                  value={selectedTransaction.metodePembayaran} 
                  onValueChange={(value) => setSelectedTransaction({...selectedTransaction, metodePembayaran: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tunai">Tunai</SelectItem>
                    <SelectItem value="kartu">Kartu</SelectItem>
                    <SelectItem value="ewallet">E-Wallet</SelectItem>
                    <SelectItem value="qris">QRIS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => handleUpdateTransaction(selectedTransaction!)}>
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
