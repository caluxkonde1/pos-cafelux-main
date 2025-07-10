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
  BarChart3,
  Bell,
  Wallet,
  HelpCircle
} from "lucide-react";
import { useDashboardStats, useTopProducts, useRecentTransactions } from "@/hooks/use-dashboard-stats";
import POSModal from "@/components/pos-modal";
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Top Navbar */}
      <div className="bg-white sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Beranda</h1>
        <button aria-label="Notifications" className="relative">
          <Bell size={24} className="text-gray-600" />
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">3</span>
        </button>
      </div>

      {/* Banner Promosi */}
      <div className="p-4">
        <div className="overflow-x-auto">
          <div className="flex space-x-4 pb-2">
            <div className="flex-shrink-0 w-80 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-4 text-white">
              <div className="flex items-center space-x-3">
                <div className="bg-white rounded-lg p-2">
                  <span className="text-red-500 font-bold text-lg">Qasir PRO</span>
                </div>
                <div>
                  <p className="font-semibold">Program Cicilan</p>
                  <p className="text-sm opacity-90">Qasir Pro atau Qasir Pro Plus dengan Cicilan Pembayaran</p>
                  <div className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold mt-1 inline-block">
                    2 Bulan*
                  </div>
                  <div className="bg-red-700 text-white px-2 py-1 rounded text-xs font-bold mt-1 ml-1 inline-block">
                    Tanya Kami
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 w-80 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-4 text-white">
              <div className="flex items-center space-x-3">
                <div className="bg-white rounded-lg p-2">
                  <span className="text-blue-500 font-bold text-lg">Konsulta</span>
                </div>
                <div>
                  <p className="font-semibold">Konsultasi Bisnis</p>
                  <p className="text-sm opacity-90">Sesuai kebutuhan bisnis Anda</p>
                  <div className="bg-white text-blue-500 px-3 py-1 rounded text-xs font-bold mt-2 inline-block">
                    Daftar Sekarang
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Menu */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Kelola Produk", icon: Package, badge: "Baru", color: "text-blue-600" },
            { label: "Pegawai", icon: Users, badge: "Baru", color: "text-green-600" },
            { label: "Outlet", icon: Warehouse, badge: "Baru", color: "text-purple-600" },
            { label: "Saldo Wallet", icon: Wallet, badge: "Pro", color: "text-orange-600" },
            { label: "Bantuan", icon: HelpCircle, badge: "Pro", color: "text-red-600" },
          ].map(({ label, icon: Icon, badge, color }) => (
            <button key={label} className="flex flex-col items-center space-y-2 p-2 bg-white rounded-lg shadow-sm">
              <div className="relative">
                <Icon size={24} className={color} />
                <span className={`absolute -top-1 -right-1 inline-flex items-center justify-center px-1 text-[8px] font-bold leading-none text-white rounded-full ${badge === 'Baru' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                  {badge}
                </span>
              </div>
              <span className="text-xs text-gray-700 text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Laporan Section */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Laporan</h2>
          <button className="text-red-500 text-sm font-medium">Lihat Semua</button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Penjualan hari ini</p>
                  {statsLoading ? (
                    <Skeleton className="h-6 w-20" />
                  ) : (
                    <p className="text-lg font-bold text-gray-900">
                      {stats ? formatCurrency(stats.penjualanHarian) : "Rp0"}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">0,00% vs kemarin</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={16} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Saldo Wallet</p>
                  <p className="text-lg font-bold text-gray-900">Rp0</p>
                  <p className="text-xs text-red-400">↓ 100,00% vs bulan lalu</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Wallet className="text-blue-600" size={16} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pengeluaran</p>
                  <p className="text-lg font-bold text-gray-900">Rp0</p>
                  <p className="text-xs text-gray-400">0,00% vs kemarin</p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <ArrowUp className="text-red-600 rotate-180" size={16} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pelanggan</p>
                  <p className="text-lg font-bold text-gray-900">{stats?.pelangganBaru || 0}</p>
                  <p className="text-xs text-gray-400">0,00% vs kemarin</p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="text-purple-600" size={16} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Paket Berlangganan */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Paket Berlangganan</h2>
        <div className="bg-gradient-to-r from-pink-100 to-red-100 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white rounded-full p-3">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Qasir PRO</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Langganan Qasir Pro untuk fitur lengkap!*</p>
              <button className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-medium mt-2">
                Beli disini {'>'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Perangkat Tambahan */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Perangkat Tambahan</h2>
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white rounded-lg p-2">
              <img src="/api/placeholder/40/40" alt="GoPay" className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Terima pembayaran GoPay hingga Rp1 juta!</p>
              <p className="text-sm text-gray-600">Daftar sekarang dan dapatkan cashback!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Transaksi Button */}
      <div className="fixed bottom-6 left-4 right-4 z-20">
        <button
          className="w-full bg-red-500 text-white py-4 rounded-lg text-lg font-semibold shadow-lg hover:bg-red-600 transition-colors"
          onClick={() => setPosModalOpen(true)}
        >
          Transaksi
        </button>
      </div>

      {/* POS Modal */}
      <POSModal open={posModalOpen} onOpenChange={setPosModalOpen} />
    </div>
  );
}
