import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft,
  Camera,
  Plus,
  X,
  Package,
  DollarSign,
  Image as ImageIcon
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface Category {
  id: number;
  nama: string;
  deskripsi?: string;
}

export default function TambahProdukNew() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Form state
  const [formData, setFormData] = useState({
    nama: "",
    kode: "",
    kategori_id: "",
    harga: "",
    stok: "",
    deskripsi: "",
    satuan: "pcs",
    status: "aktif"
  });

  const [images, setImages] = useState<string[]>([]);

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error("Failed to create product");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Produk berhasil ditambahkan!" });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setLocation("/produk");
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menambahkan produk",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImages(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!formData.nama || !formData.kategori_id || !formData.harga) {
      toast({
        title: "Form tidak lengkap",
        description: "Nama, kategori, dan harga harus diisi",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      ...formData,
      harga: parseFloat(formData.harga),
      stok: parseInt(formData.stok) || 0,
      kategori_id: parseInt(formData.kategori_id),
      images: images
    };

    createProductMutation.mutate(productData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/produk")}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Tambah Produk</h1>
              <p className="text-sm text-gray-500">Buat produk baru</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24 space-y-4">
        {/* Nama Produk */}
        <div>
          <Input
            value={formData.nama}
            onChange={(e) => handleInputChange("nama", e.target.value)}
            placeholder="Nama Produk"
            className="h-12 text-base border-gray-200 rounded-lg"
          />
        </div>

        {/* Harga Jual */}
        <div>
          <Input
            type="number"
            value={formData.harga}
            onChange={(e) => handleInputChange("harga", e.target.value)}
            placeholder="Harga Jual"
            className="h-12 text-base border-gray-200 rounded-lg"
          />
        </div>

        {/* Merk */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Merk</p>
              <p className="text-base text-gray-700">Pilih Merek</p>
            </div>
            <div className="text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Kategori */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Kategori</p>
              <Select value={formData.kategori_id} onValueChange={(value) => handleInputChange("kategori_id", value)}>
                <SelectTrigger className="border-0 p-0 h-auto text-base text-gray-700">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Produk Favorit */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-medium text-gray-900">Produk Favorit</h3>
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Baru</span>
              </div>
              <p className="text-sm text-gray-500">Tampilkan produk di kategori terdepan.</p>
            </div>
            <div className="w-12 h-6 bg-gray-300 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
            </div>
          </div>
        </div>

        {/* Atur Harga Modal dan Barcode */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-gray-900">Atur Harga Modal dan Barcode</h3>
            <div className="w-12 h-6 bg-gray-300 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
            </div>
          </div>
        </div>

        {/* Kelola Stok */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900">Kelola Stok</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Stok Tidak Aktif</span>
              <div className="text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Atur Harga Grosir */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900">Atur Harga Grosir</h3>
              <p className="text-sm text-gray-600">Kamu akan lebih leluasa mengatur harga grosir sesuai keinginanmu.</p>
            </div>
            <div className="text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tambah Varian */}
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 text-center">
          <h3 className="text-base font-medium text-gray-700">Tambah Varian</h3>
        </div>
      </div>

      {/* Bottom Action - Above Mobile Footer */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t p-4 z-10 md:bottom-4">
        <Button
          onClick={handleSubmit}
          disabled={createProductMutation.isPending}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium"
        >
          {createProductMutation.isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
