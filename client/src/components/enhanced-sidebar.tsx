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
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  // Get page title based on current location
  const getPageTitle = (path: string) => {
    const pageMap: { [key: string]: string } = {
      "/": "Beranda",
      "/menunggu-pembayaran": "Menunggu Pembayaran",
      "/absensi": "Absensi",
      "/produk": "Kelola Produk",
      "/penjualan": "Transaksi",
      "/riwayat-transaksi": "Riwayat Transaksi",
      "/rekap-kas": "Rekap Kas",
      "/pengingat": "Pengingat",
      "/pelanggan": "Pelanggan",
      "/laporan": "Laporan",
      "/outlet": "Outlet",
      "/pegawai": "Pegawai",
      "/inventaris": "Inventaris",
      "/pengaturan-meja": "Pengaturan Meja",
      "/pengaturan": "Pengaturan"
    };
    return pageMap[path] || "Qasir POS";
  };

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

      {/* Mobile Header with Hamburger Menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 px-4 py-3 z-30">
        <div className="flex items-center justify-between">
          {/* Hamburger Menu - Left Side */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2 -ml-2">
                <Menu className="h-6 w-6 text-gray-700" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              {/* Mobile Menu Content */}
              <div className="flex flex-col h-full bg-white">
                {/* Brand Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-red-500 to-red-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <ScanBarcode className="text-red-500" size={20} />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-white">Qasir</h1>
                        <p className="text-sm text-red-100">Sistem POS Terdepan</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="p-1 text-white hover:bg-red-400" onClick={() => setIsOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

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
                  </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 py-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href;
                    
                    return (
                      <Link key={item.href} href={item.href}>
                        <div 
                          className={cn(
                            "flex items-center justify-between px-4 py-3 mx-2 transition-colors cursor-pointer",
                            isActive 
                              ? "bg-red-50 border-r-4 border-red-500 text-red-600" 
                              : "text-gray-700 hover:bg-gray-50"
                          )}
                          onClick={handleLinkClick}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon size={20} className={isActive ? "text-red-600" : "text-gray-500"} />
                            <span className="font-medium">{item.label}</span>
                          </div>
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
              </div>
            </SheetContent>
          </Sheet>

          {/* Page Title - Center */}
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-900">{getPageTitle(location)}</h1>
          </div>

          {/* Notification Icon - Right Side */}
          <Button variant="ghost" size="sm" className="p-2 -mr-2">
            <div className="relative">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">3</span>
              </div>
            </div>
          </Button>
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
