import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScanBarcode, Search, Filter, Download, Eye, Receipt } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import POSModal from "@/components/pos-modal";
import type { TransactionWithItems } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import Header from "@/components/header";

export default function Penjualan() {
  const [posModalOpen, setPosModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: transactions = [], isLoading } = useQuery<TransactionWithItems[]>({
    queryKey: ["/api/transactions"],
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

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.nomorTransaksi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customer?.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.kasir.nama.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPenjualan = transactions.reduce((sum, t) => sum + parseFloat(t.total), 0);
  const totalTransaksi = transactions.length;
  const transaksiHariIni = transactions.filter(t => {
    const today = new Date();
    const transactionDate = new Date(t.createdAt);
    return transactionDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="space-y-6">
      <Header 
        title="Penjualan" 
        subtitle="Kelola transaksi penjualan dan riwayat pembayaran" 
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-qasir-text-light text-sm">Total Penjualan</p>
                <p className="text-2xl font-bold text-qasir-text">{formatCurrency(totalPenjualan)}</p>
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
                <p className="text-qasir-text-light text-sm">Total Transaksi</p>
                <p className="text-2xl font-bold text-qasir-text">{totalTransaksi}</p>
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
                <p className="text-qasir-text-light text-sm">Transaksi Hari Ini</p>
                <p className="text-2xl font-bold text-qasir-text">{transaksiHariIni}</p>
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
            <CardTitle className="text-xl font-bold text-qasir-text">Riwayat Transaksi</CardTitle>
            <Button 
              className="bg-qasir-red hover:bg-red-600"
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
            <Button variant="outline">
              <Filter className="mr-2" size={16} />
              Filter
            </Button>
            <Button variant="outline">
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
                      <div className="text-qasir-text-light">
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
                        <Button variant="ghost" size="sm">
                          <Eye size={16} />
                        </Button>
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
    </div>
  );
}
