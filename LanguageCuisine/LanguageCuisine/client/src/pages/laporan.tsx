import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  FileText,
  Filter,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header";
import type { TransactionWithItems, Product } from "@shared/schema";
import { formatDistanceToNow, format, subDays, startOfDay, endOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker";

interface SalesReportData {
  date: string;
  total: number;
  transactions: number;
}

export default function Laporan() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [reportType, setReportType] = useState<"day" | "week" | "month">("day");
  const [selectedPeriod, setSelectedPeriod] = useState("7days");

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<TransactionWithItems[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: salesData = [], isLoading: salesLoading } = useQuery<SalesReportData[]>({
    queryKey: ["/api/reports/sales", { 
      startDate: dateRange?.from?.toISOString(),
      endDate: dateRange?.to?.toISOString(),
      groupBy: reportType 
    }],
    enabled: !!dateRange?.from && !!dateRange?.to,
  });

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  // Calculate summary statistics for the selected period
  const filteredTransactions = transactions.filter(transaction => {
    if (!dateRange?.from || !dateRange?.to) return true;
    const transactionDate = new Date(transaction.createdAt);
    return transactionDate >= startOfDay(dateRange.from) && transactionDate <= endOfDay(dateRange.to);
  });

  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.total), 0);
  const totalTransactions = filteredTransactions.length;
  const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const totalProducts = filteredTransactions.reduce((sum, t) => 
    sum + t.items.reduce((itemSum, item) => itemSum + item.jumlah, 0), 0
  );

  // Product performance analysis
  const productSales = new Map<number, { product: Product; quantity: number; revenue: number }>();
  
  filteredTransactions.forEach(transaction => {
    transaction.items.forEach(item => {
      const existing = productSales.get(item.productId) || {
        product: products.find(p => p.id === item.productId)!,
        quantity: 0,
        revenue: 0
      };
      existing.quantity += item.jumlah;
      existing.revenue += parseFloat(item.subtotal);
      productSales.set(item.productId, existing);
    });
  });

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Payment method analysis
  const paymentMethods = new Map<string, { count: number; total: number }>();
  filteredTransactions.forEach(transaction => {
    const existing = paymentMethods.get(transaction.metodePembayaran) || { count: 0, total: 0 };
    existing.count += 1;
    existing.total += parseFloat(transaction.total);
    paymentMethods.set(transaction.metodePembayaran, existing);
  });

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'tunai': return 'Tunai';
      case 'kartu': return 'Kartu';
      case 'ewallet': return 'E-Wallet';
      case 'qris': return 'QRIS';
      default: return method;
    }
  };

  const setPredefinedRange = (period: string) => {
    setSelectedPeriod(period);
    const now = new Date();
    
    switch (period) {
      case "today":
        setDateRange({ from: now, to: now });
        break;
      case "7days":
        setDateRange({ from: subDays(now, 7), to: now });
        break;
      case "30days":
        setDateRange({ from: subDays(now, 30), to: now });
        break;
      case "90days":
        setDateRange({ from: subDays(now, 90), to: now });
        break;
    }
  };

  return (
    <div className="space-y-6">
      <Header 
        title="Laporan" 
        subtitle="Analisis performa bisnis dan laporan penjualan" 
      />

      {/* Date Range and Export Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex gap-2">
                {[
                  { key: "today", label: "Hari Ini" },
                  { key: "7days", label: "7 Hari" },
                  { key: "30days", label: "30 Hari" },
                  { key: "90days", label: "90 Hari" },
                ].map(period => (
                  <Button
                    key={period.key}
                    variant={selectedPeriod === period.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPredefinedRange(period.key)}
                    className={selectedPeriod === period.key ? "bg-qasir-red hover:bg-red-600" : ""}
                  >
                    {period.label}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Input
                  type="date"
                  value={dateRange?.from?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setDateRange({ from: new Date(e.target.value), to: dateRange?.to || new Date() })}
                  className="w-40"
                />
                <span className="text-gray-500">sampai</span>
                <Input
                  type="date"
                  value={dateRange?.to?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setDateRange({ from: dateRange?.from || new Date(), to: new Date(e.target.value) })}
                  className="w-40"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={reportType} onValueChange={(value: "day" | "week" | "month") => setReportType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Harian</SelectItem>
                  <SelectItem value="week">Mingguan</SelectItem>
                  <SelectItem value="month">Bulanan</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-qasir-text-light text-sm">Total Pendapatan</p>
                <p className="text-2xl font-bold text-qasir-text">{formatCurrency(totalRevenue)}</p>
                <p className="text-green-600 text-sm mt-1 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +12.5% dari periode sebelumnya
                </p>
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
                <p className="text-qasir-text-light text-sm">Total Transaksi</p>
                <p className="text-2xl font-bold text-qasir-text">{totalTransactions}</p>
                <p className="text-blue-600 text-sm mt-1 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +8.2% dari periode sebelumnya
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-qasir-text-light text-sm">Rata-rata Transaksi</p>
                <p className="text-2xl font-bold text-qasir-text">{formatCurrency(averageOrderValue)}</p>
                <p className="text-purple-600 text-sm mt-1 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +5.1% dari periode sebelumnya
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-qasir-text-light text-sm">Produk Terjual</p>
                <p className="text-2xl font-bold text-qasir-text">{totalProducts}</p>
                <p className="text-orange-600 text-sm mt-1 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +15.3% dari periode sebelumnya
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="text-orange-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Reports */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Penjualan</TabsTrigger>
          <TabsTrigger value="products">Produk</TabsTrigger>
          <TabsTrigger value="payments">Pembayaran</TabsTrigger>
          <TabsTrigger value="customers">Pelanggan</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Grafik Penjualan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {salesLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="mx-auto text-4xl text-gray-400 mb-2" size={48} />
                    <p className="text-qasir-text-light">Grafik Penjualan</p>
                    <p className="text-sm text-qasir-text-light mt-1">
                      {salesData.length} data point untuk periode yang dipilih
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detail Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>No. Transaksi</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Pembayaran</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <FileText className="mx-auto mb-2" size={32} />
                        <p className="text-qasir-text-light">Tidak ada transaksi pada periode ini</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.slice(0, 10).map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{format(new Date(transaction.createdAt), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="font-medium">{transaction.nomorTransaksi}</TableCell>
                        <TableCell>{transaction.customer?.nama || "Umum"}</TableCell>
                        <TableCell>{transaction.items.length} item</TableCell>
                        <TableCell>{getPaymentMethodLabel(transaction.metodePembayaran)}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(transaction.total)}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">Berhasil</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Produk Terlaris</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ranking</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Terjual</TableHead>
                    <TableHead>Pendapatan</TableHead>
                    <TableHead>Harga Satuan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Package className="mx-auto mb-2" size={32} />
                        <p className="text-qasir-text-light">Tidak ada data penjualan produk</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    topProducts.map((item, index) => (
                      <TableRow key={item.product.id}>
                        <TableCell>
                          <Badge variant={index < 3 ? "default" : "secondary"}>
                            #{index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{item.product.nama}</TableCell>
                        <TableCell>{item.product.kategori}</TableCell>
                        <TableCell>{item.quantity} unit</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(item.revenue)}</TableCell>
                        <TableCell>{formatCurrency(item.product.harga)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metode Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {Array.from(paymentMethods.entries()).map(([method, data]) => (
                    <div key={method} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{getPaymentMethodLabel(method)}</p>
                        <p className="text-sm text-gray-500">{data.count} transaksi</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(data.total)}</p>
                        <p className="text-sm text-gray-500">
                          {((data.total / totalRevenue) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="mx-auto text-4xl text-gray-400 mb-2" size={48} />
                    <p className="text-qasir-text-light">Chart Metode Pembayaran</p>
                    <p className="text-sm text-qasir-text-light mt-1">Visualisasi distribusi pembayaran</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analisis Pelanggan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <Users className="mx-auto mb-2 text-blue-600" size={32} />
                  <p className="text-2xl font-bold text-blue-600">
                    {filteredTransactions.filter(t => t.customer).length}
                  </p>
                  <p className="text-sm text-blue-600">Pelanggan Terdaftar</p>
                </div>
                
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <ShoppingCart className="mx-auto mb-2 text-green-600" size={32} />
                  <p className="text-2xl font-bold text-green-600">
                    {filteredTransactions.filter(t => !t.customer).length}
                  </p>
                  <p className="text-sm text-green-600">Pelanggan Umum</p>
                </div>
                
                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <TrendingUp className="mx-auto mb-2 text-purple-600" size={32} />
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(
                      filteredTransactions
                        .filter(t => t.customer)
                        .reduce((sum, t) => sum + parseFloat(t.total), 0) /
                      Math.max(filteredTransactions.filter(t => t.customer).length, 1)
                    )}
                  </p>
                  <p className="text-sm text-purple-600">Rata-rata per Pelanggan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
