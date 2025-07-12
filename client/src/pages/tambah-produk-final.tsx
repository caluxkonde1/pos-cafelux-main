import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ChevronRight, Plus, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface Category {
  id: number;
  nama: string;
  deskripsi?: string;
}

interface ProductVariant {
  id: string;
  nama: string;
  harga: number;
  stok: number;
}

export default function TambahProdukFinal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Form state
  const [formData, setFormData] = useState({
    nama: "",
    harga: "",
    merk: "",
    kategori_id: "",
    deskripsi: "",
    stok: "",
    satuan: "pcs",
    barcode: "",
    hargaModal: "",
    produkFavorit: false,
    aturHargaModal: false,
    kelolaStok: false
  });

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [newVariant, setNewVariant] = useState({
    nama: "",
    harga: "",
    stok: ""
  });

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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddVariant = () => {
    if (!newVariant.nama || !newVariant.harga || !newVariant.stok) {
      toast({
        title: "Form tidak lengkap",
        description: "Semua field varian harus diisi",
        variant: "destructive",
      });
      return;
    }

    const variant: ProductVariant = {
      id: Date.now().toString(),
      nama: newVariant.nama,
      harga: parseFloat(newVariant.harga),
      stok: parseInt(newVariant.stok)
    };

    setVariants(prev => [...prev, variant]);
    setNewVariant({ nama: "", harga: "", stok: "" });
    setShowVariantModal(false);
    toast({ title: "Varian berhasil ditambahkan!" });
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(prev => prev.filter(v => v.id !== id));
    toast({ title: "Varian berhasil dihapus!" });
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

    // Prepare product data according to API schema
    const productData = {
      nama: formData.nama,
      harga: parseFloat(formData.harga),
      kategori_id: parseInt(formData.kategori_id),
      stok: formData.stok ? parseInt(formData.stok) : 0,
      satuan: formData.satuan || "pcs",
      deskripsi: formData.deskripsi || "",
      merk: formData.merk || "",
      barcode: formData.barcode || "",
      harga_modal: formData.hargaModal ? parseFloat(formData.hargaModal) : null,
      is_favorit: formData.produkFavorit,
      kelola_stok: formData.kelolaStok,
      variants: variants.length > 0 ? variants : undefined
    };

    console.log("Sending product data:", productData);
    createProductMutation.mutate(productData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="flex items-center p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/produk")}
            className="p-2 mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Tambah Produk</h1>
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
            className="h-12 text-base border-gray-200 rounded-lg bg-white"
          />
        </div>

        {/* Harga Jual */}
        <div>
          <Input
            type="number"
            value={formData.harga}
            onChange={(e) => handleInputChange("harga", e.target.value)}
            placeholder="Harga Jual"
            className="h-12 text-base border-gray-200 rounded-lg bg-white"
          />
        </div>

        {/* Merk */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Merk</p>
              <Input
                value={formData.merk}
                onChange={(e) => handleInputChange("merk", e.target.value)}
                placeholder="Pilih Merek"
                className="border-0 p-0 h-auto text-base text-gray-700 focus:ring-0"
              />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Kategori */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Kategori</p>
              <Select value={formData.kategori_id} onValueChange={(value) => handleInputChange("kategori_id", value)}>
                <SelectTrigger className="border-0 p-0 h-auto text-base text-gray-700 focus:ring-0">
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
            <ChevronRight className="w-5 h-5 text-gray-400" />
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
            <Switch
              checked={formData.produkFavorit}
              onCheckedChange={(checked) => handleInputChange("produkFavorit", checked)}
            />
          </div>
        </div>

        {/* Atur Harga Modal dan Barcode */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-gray-900">Atur Harga Modal dan Barcode</h3>
            <Switch
              checked={formData.aturHargaModal}
              onCheckedChange={(checked) => handleInputChange("aturHargaModal", checked)}
            />
          </div>
        </div>

        {/* Kelola Stok */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900">Kelola Stok</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {formData.kelolaStok ? "Stok Aktif" : "Stok Tidak Aktif"}
              </span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
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
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Varian Produk */}
        {variants.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-base font-medium text-gray-900">Varian Produk</h3>
            {variants.map((variant) => (
              <div key={variant.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{variant.nama}</p>
                    <p className="text-sm text-gray-500">
                      Rp {variant.harga.toLocaleString()} • Stok: {variant.stok}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveVariant(variant.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tambah Varian */}
        <div 
          className="bg-gray-100 border border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => setShowVariantModal(true)}
        >
          <div className="flex items-center justify-center gap-2">
            <Plus className="h-5 w-5 text-gray-600" />
            <h3 className="text-base font-medium text-gray-700">Tambah Varian</h3>
          </div>
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

      {/* Add Variant Modal */}
      <Dialog open={showVariantModal} onOpenChange={setShowVariantModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Varian Produk</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Nama Varian
              </label>
              <Input
                value={newVariant.nama}
                onChange={(e) => setNewVariant(prev => ({ ...prev, nama: e.target.value }))}
                placeholder="Contoh: Ukuran L, Rasa Coklat"
                className="w-full"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Harga
                </label>
                <Input
                  type="number"
                  value={newVariant.harga}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, harga: e.target.value }))}
                  placeholder="0"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Stok
                </label>
                <Input
                  type="number"
                  value={newVariant.stok}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, stok: e.target.value }))}
                  placeholder="0"
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowVariantModal(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={handleAddVariant}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                Tambah Varian
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
