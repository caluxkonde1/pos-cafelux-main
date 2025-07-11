import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  BarChart3, 
  Settings, 
  Package2,
  ChevronRight,
  ShoppingCart,
  Layers,
  ChefHat,
  Boxes
} from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  badge?: string;
  isProFeature?: boolean;
}

function MenuItem({ icon, title, description, onClick, badge, isProFeature }: MenuItemProps) {
  const { hasFeature } = usePermissions();
  const canAccess = !isProFeature || hasFeature('advancedReporting');

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        !canAccess ? 'opacity-50' : 'hover:border-primary/50'
      }`}
      onClick={canAccess ? onClick : undefined}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${
              canAccess ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
            }`}>
              {icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{title}</h3>
                {badge && (
                  <Badge variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                )}
                {isProFeature && !canAccess && (
                  <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                    Pro
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 text-sm mt-1">{description}</p>
            </div>
          </div>
          <ChevronRight className={`h-5 w-5 ${
            canAccess ? 'text-gray-400' : 'text-gray-300'
          }`} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function KelolaProductPage() {
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);

  const menuItems = [
    {
      id: 'produk',
      icon: <Package className="h-6 w-6" />,
      title: 'Produk',
      description: 'Kelola semua produk untuk katalog toko kamu di sini.',
      onClick: () => window.location.href = '/produk',
      isProFeature: false
    },
    {
      id: 'atur-stok',
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Atur Stok',
      description: 'Ubah, tambah, atau kurangi stok produk dengan cepat.',
      onClick: () => window.location.href = '/atur-stok',
      isProFeature: false
    },
    {
      id: 'opsi-tambahan',
      icon: <Settings className="h-6 w-6" />,
      title: 'Opsi Tambahan',
      description: 'Atur opsi tambahan yang kamu butuhkan untuk produk mu di sini.',
      onClick: () => window.location.href = '/produk/opsi-tambahan',
      isProFeature: true
    },
    {
      id: 'bundel',
      icon: <Package2 className="h-6 w-6" />,
      title: 'Bundel',
      description: 'Kelola bundel kumpulan produk untuk katalog toko kamu di sini.',
      onClick: () => window.location.href = '/produk/bundel',
      isProFeature: true
    },
    {
      id: 'bahan-baku',
      icon: <ChefHat className="h-6 w-6" />,
      title: 'Bahan Baku & Resep',
      description: 'Buat resep produk dari bahan baku.',
      onClick: () => window.location.href = '/produk/bahan-baku',
      isProFeature: true
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => window.history.back()}
          className="p-2"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
        </Button>
        <h1 className="text-2xl font-bold">Kelola Produk</h1>
      </div>

      {/* Menu Items */}
      <div className="space-y-4">
        {menuItems.map((item) => (
          <MenuItem
            key={item.id}
            icon={item.icon}
            title={item.title}
            description={item.description}
            onClick={item.onClick}
            isProFeature={item.isProFeature}
          />
        ))}
      </div>

      {/* Pro Features Info */}
      <Card className="mt-8 border-orange-200 bg-orange-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Boxes className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-2">
                Fitur Pro untuk Manajemen Produk Lanjutan
              </h3>
              <p className="text-orange-700 text-sm mb-4">
                Dapatkan akses ke fitur-fitur canggih seperti opsi tambahan produk, 
                bundel produk, dan manajemen bahan baku dengan resep untuk mengoptimalkan 
                operasional bisnis Anda.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-orange-700">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                  Opsi tambahan produk (size, warna, dll)
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                  Bundel produk dengan diskon
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                  Manajemen bahan baku
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                  Resep produk otomatis
                </div>
              </div>
              <Button 
                className="mt-4 bg-orange-600 hover:bg-orange-700"
                onClick={() => window.location.href = '/berlangganan'}
              >
                Upgrade ke Pro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
