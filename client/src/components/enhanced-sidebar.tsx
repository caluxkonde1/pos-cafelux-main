import { Link, useLocation } from "wouter";
import { 
  Home, 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Users, 
  Bus, 
  ScanBarcode, 
  Crown, 
  Warehouse, 
  Percent,
  CreditCard,
  Clock,
  History,
  Calculator,
  Bell,
  FileText,
  Building,
  Archive,
  Utensils,
  Settings,
  User,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/menunggu-pembayaran", label: "Menunggu Pembayaran", icon: CreditCard },
  { href: "/", label: "Beranda", icon: Home },
  { href: "/absensi", label: "Absensi", icon: Clock, badge: "PRO", isPro: true },
  { href: "/produk", label: "Kelola Produk", icon: Package },
  { href: "/penjualan", label: "Transaksi", icon: ScanBarcode },
  { href: "/riwayat-transaksi", label: "Riwayat Transaksi", icon: History },
  { href: "/rekap-kas", label: "Rekap Kas", icon: Calculator },
  { href: "/pengingat", label: "Pengingat", icon: Bell, badge: "Baru", isNew: true },
  { href: "/pelanggan", label: "Pelanggan", icon: Users },
  { href: "/laporan", label: "Laporan", icon: BarChart3 },
  { href: "/outlet", label: "Outlet", icon: Building },
  { href: "/pegawai", label: "Pegawai", icon: Bus },
  { href: "/inventaris", label: "Inventaris", icon: Archive, badge: "Baru", isNew: true },
  { href: "/pengaturan-meja", label: "Pengaturan Meja", icon: Utensils },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings, badge: "Baru", isNew: true },
];

export default function EnhancedSidebar() {
  const [location] = useLocation();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 bg-white shadow-lg fixed h-full z-20 border-r border-gray-200 overflow-y-auto">
        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border-2 border-red-500">
              <User className="text-gray-600" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Muhammad Syahrul A...</h3>
              <p className="text-sm text-gray-500">Pemilik</p>
              <Badge className="bg-red-500 text-white text-xs mt-1">FREE</Badge>
            </div>
            <ChevronRight className="text-gray-400" size={16} />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer group",
                  isActive 
                    ? "bg-red-500 text-white" 
                    : "text-gray-700 hover:bg-gray-50"
                )}>
                  <Icon size={18} className={cn(
                    isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                  )} />
                  <span className="font-medium flex-1">{item.label}</span>
                  
                  {/* Badges */}
                  {item.badge && (
                    <Badge 
                      className={cn(
                        "text-xs px-2 py-0.5",
                        item.isPro 
                          ? "bg-orange-500 text-white" 
                          : item.isNew 
                            ? "bg-blue-500 text-white"
                            : "bg-gray-500 text-white"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Section */}
        <div className="p-4 mt-4">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-4 text-white">
            <p className="text-sm font-medium mb-2">Upgrade sekarang!</p>
            <p className="text-xs opacity-90 mb-3">Dapatkan fitur lengkap Pro dan Pro Plus</p>
            <Button className="w-full bg-white text-red-500 hover:bg-gray-100 text-sm font-semibold">
              Upgrade Paket
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 px-4 py-3 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <ScanBarcode className="text-white" size={16} />
            </div>
            <h1 className="text-lg font-bold text-gray-900">Qasir</h1>
          </div>
          
          {/* Mobile User Profile */}
          <div className="flex items-center space-x-2">
            <Badge className="bg-red-500 text-white text-xs">FREE</Badge>
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border border-red-500">
              <User className="text-gray-600" size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-30">
        <div className="grid grid-cols-5 gap-1">
          {[
            { href: "/", label: "Beranda", icon: Home },
            { href: "/penjualan", label: "Transaksi", icon: ScanBarcode },
            { href: "/produk", label: "Produk", icon: Package },
            { href: "/laporan", label: "Laporan", icon: BarChart3 },
            { href: "/pengaturan", label: "Menu", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex flex-col items-center py-2 px-1 rounded-lg transition-colors",
                  isActive 
                    ? "text-red-500" 
                    : "text-gray-500"
                )}>
                  <Icon size={20} />
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile padding for fixed header and bottom nav */}
      <div className="lg:hidden h-16"></div>
      <div className="lg:hidden pb-20"></div>
    </>
  );
}
