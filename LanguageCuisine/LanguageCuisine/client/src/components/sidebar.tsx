import { Link, useLocation } from "wouter";
import { Home, BarChart3, ShoppingCart, Package, Users, Bus, ScanBarcode, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/laporan", label: "Laporan", icon: BarChart3 },
  { href: "/penjualan", label: "Penjualan", icon: ShoppingCart },
  { href: "/produk", label: "Produk", icon: Package },
  { href: "/pelanggan", label: "Pelanggan", icon: Users },
  { href: "/pegawai", label: "Pegawai", icon: Bus },
  { href: "/berlangganan", label: "Berlangganan", icon: Crown },
];

export default function Sidebar() {
  const [location] = useLocation();

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

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 px-4 py-3 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-qasir-red rounded-lg flex items-center justify-center">
              <ScanBarcode className="text-white" size={16} />
            </div>
            <h1 className="text-lg font-bold text-qasir-text">Qasir</h1>
          </div>
        </div>
      </div>

      {/* Mobile padding for fixed header */}
      <div className="lg:hidden h-16"></div>
    </>
  );
}
