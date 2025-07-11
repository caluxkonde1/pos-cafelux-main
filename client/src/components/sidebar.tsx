import { Link, useLocation } from "wouter";
import { Home, BarChart3, ShoppingCart, Package, Users, Bus, ScanBarcode, Crown, Warehouse, Percent, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState } from "react";

const menuItems = [
  { href: "/pembayaran", label: "Menunggu Pembayaran", icon: Home },
  { href: "/", label: "Beranda", icon: Home },
  { href: "/absensi", label: "Absensi", icon: BarChart3 },
  { href: "/produk", label: "Kelola Produk", icon: Package },
  { href: "/penjualan", label: "Transaksi", icon: ShoppingCart },
  { href: "/riwayat", label: "Riwayat Transaksi", icon: BarChart3 },
  { href: "/rekap", label: "Rekap Kas", icon: BarChart3 },
  { href: "/pengingt", label: "Pengingt", icon: Bus },
  { href: "/pelanggan", label: "Pelanggan", icon: Users },
  { href: "/laporan", label: "Laporan", icon: BarChart3 },
  { href: "/outlet", label: "Outlet", icon: Package },
  { href: "/pegawai", label: "Pegawai", icon: Bus },
  { href: "/inventaris", label: "Inventaris", icon: Warehouse },
  { href: "/pengaturan-meja", label: "Pengaturan Meja", icon: Package },
  { href: "/pengaturan", label: "Pengaturan", icon: Package },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  // Get page title based on current location
  const getPageTitle = (path: string) => {
    const pageMap: { [key: string]: string } = {
      "/": "Beranda",
      "/pembayaran": "Menunggu Pembayaran",
      "/absensi": "Absensi",
      "/produk": "Kelola Produk",
      "/penjualan": "Transaksi",
      "/riwayat": "Riwayat Transaksi",
      "/rekap": "Rekap Kas",
      "/pengingt": "Pengingt",
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
      <div className="hidden lg:block w-72 bg-white shadow-lg fixed h-full z-20 border-r border-gray-200">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-qasir-red rounded-lg flex items-center justify-center">
              <ScanBarcode className="text-white text-lg" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-qasir-text">Qasir</h1>
              <p className="text-sm text-qasir-text-light">Sistem POS Terdepan</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer",
                  isActive 
                    ? "bg-qasir-red text-white" 
                    : "text-qasir-text hover:bg-gray-100"
                )}>
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Section */}
        <div className="absolute bottom-6 left-4 right-4">
          <div className="bg-gradient-to-r from-qasir-red to-red-600 rounded-lg p-4 text-white">
            <p className="text-sm font-medium mb-2">Upgrade sekarang!</p>
            <p className="text-xs opacity-90 mb-3">Dapatkan fitur lengkap Pro dan Pro Plus</p>
            <Button className="w-full bg-white text-qasir-red hover:bg-gray-100 text-sm font-semibold">
              Upgrade Paket
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Header with Burger Menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 px-4 py-3 z-30">
        <div className="flex items-center justify-between">
          {/* Burger Menu - Left Side */}
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
                    <div className="w-12 h-12 bg-qasir-red rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">MA</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Muhammad Syahrul A...</h3>
                      <p className="text-sm text-gray-500">Pemilik</p>
                      <div className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded mt-1">
                        FREE
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 py-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href;
                    
                    // Add badges for specific items
                    const getBadge = (href: string) => {
                      if (href === "/absensi") return { text: "PRO", color: "bg-green-500" };
                      if (href === "/pengingt") return { text: "Baru", color: "bg-blue-500" };
                      if (href === "/inventaris") return { text: "Baru", color: "bg-blue-500" };
                      if (href === "/pengaturan") return { text: "Baru", color: "bg-blue-500" };
                      return null;
                    };

                    const badge = getBadge(item.href);
                    
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
                          {badge && (
                            <span className={`${badge.color} text-white text-xs px-2 py-1 rounded`}>
                              {badge.text}
                            </span>
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

      {/* Mobile padding for fixed header */}
      <div className="lg:hidden h-16"></div>
    </>
  );
}
