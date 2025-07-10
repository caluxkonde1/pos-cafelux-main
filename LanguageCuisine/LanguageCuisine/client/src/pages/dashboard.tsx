import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Users, 
  ScanBarcode,
  Plus,
  FileText,
  Warehouse,
  ArrowUp,
  Receipt,
  BarChart3
} from "lucide-react";
import { useDashboardStats, useTopProducts, useRecentTransactions } from "@/hooks/use-dashboard-stats";
import POSModal from "@/components/pos-modal";
import PricingPlans from "@/components/pricing-plans";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export default function Dashboard() {
  const [posModalOpen, setPosModalOpen] = useState(false);
  
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: topProducts, isLoading: productsLoading } = useTopProducts();
  const { data: recentTransactions, isLoading: transactionsLoading } = useRecentTransactions();

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-green-600";
    if (growth < 0) return "text-red-600";
    return "text-gray-600";
  };

  const statisticsCards = [
    {
      title: "Penjualan Hari Ini",
      value: stats ? formatCurrency(stats.penjualanHarian) : "Rp 0",
      growth: stats?.pertumbuhanPenjualan || 0,
      icon: TrendingUp,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Total Transaksi",
      value: stats?.totalTransaksi || 0,
      growth: stats?.pertumbuhanTransaksi || 0,
      icon: ShoppingCart,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Produk Terjual",
      value: stats?.produkTerjual || 0,
      growth: stats?.pertumbuhanProduk || 0,
      icon: Package,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Pelanggan Baru",
      value: stats?.pelangganBaru || 0,
      growth: stats?.pertumbuhanPelanggan || 0,
      icon: Users,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statisticsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-qasir-text-light text-sm">{stat.title}</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-24 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-qasir-text">{stat.value}</p>
                    )}
                    {!statsLoading && (
                      <p className={`text-sm mt-1 flex items-center space-x-1 ${getGrowthColor(stat.growth)}`}>
                        <ArrowUp className="h-3 w-3" />
                        <span>{stat.growth.toFixed(1)}% dari kemarin</span>
                      </p>
                    )}
                  </div>
                  <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`${stat.iconColor} text-xl`} size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sales Chart and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart Placeholder */}
        <Card className="lg:col-span-2 border border-gray-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-qasir-text">Grafik Penjualan</CardTitle>
              <div className="flex space-x-2">
                <Button size="sm" className="bg-qasir-red hover:bg-red-600">7 Hari</Button>
                <Button size="sm" variant="outline">30 Hari</Button>
                <Button size="sm" variant="outline">90 Hari</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="mx-auto text-4xl text-gray-400 mb-2" size={48} />
                <p className="text-qasir-text-light">Grafik Penjualan 7 Hari Terakhir</p>
                <p className="text-sm text-qasir-text-light mt-1">Akan ditampilkan dengan implementasi chart</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-qasir-text">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full bg-qasir-red hover:bg-red-600 flex items-center space-x-3"
              onClick={() => setPosModalOpen(true)}
            >
              <ScanBarcode size={18} />
              <span>Buka Kasir</span>
            </Button>
            <Button className="w-full bg-blue-500 hover:bg-blue-600 flex items-center space-x-3">
              <Plus size={18} />
              <span>Tambah Produk</span>
            </Button>
            <Button className="w-full bg-green-500 hover:bg-green-600 flex items-center space-x-3">
              <FileText size={18} />
              <span>Lihat Laporan</span>
            </Button>
            <Button className="w-full bg-purple-500 hover:bg-purple-600 flex items-center space-x-3">
              <Warehouse size={18} />
              <span>Kelola Stok</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="border border-gray-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-qasir-text">Transaksi Terbaru</CardTitle>
              <Button variant="link" className="text-qasir-red p-0">Lihat Semua</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {transactionsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))
            ) : recentTransactions && recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-qasir-red rounded-full flex items-center justify-center">
                      <Receipt className="text-white" size={14} />
                    </div>
                    <div>
                      <p className="font-medium text-qasir-text">{transaction.nomorTransaksi}</p>
                      <p className="text-sm text-qasir-text-light">
                        {formatDistanceToNow(new Date(transaction.createdAt), { 
                          addSuffix: true, 
                          locale: id 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-qasir-text">{formatCurrency(transaction.total)}</p>
                    <Badge className="bg-green-100 text-green-800 text-xs">Berhasil</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-qasir-text-light">
                <Receipt className="mx-auto mb-2" size={32} />
                <p>Belum ada transaksi hari ini</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border border-gray-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-qasir-text">Produk Terlaris</CardTitle>
              <Button variant="link" className="text-qasir-red p-0">Lihat Semua</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {productsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))
            ) : topProducts && topProducts.length > 0 ? (
              topProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="text-gray-500" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-qasir-text">{product.nama}</p>
                      <p className="text-sm text-qasir-text-light">{product.kategori}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-qasir-text">{product.totalTerjual} terjual</p>
                    <p className="text-sm text-qasir-text-light">{formatCurrency(product.harga)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-qasir-text-light">
                <Package className="mx-auto mb-2" size={32} />
                <p>Belum ada data penjualan produk</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pricing Plans */}
      <PricingPlans />

      {/* POS Modal */}
      <POSModal open={posModalOpen} onOpenChange={setPosModalOpen} />
    </div>
  );
}
