import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, Plus, X, Upload } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Category {
  id: number;
  nama: string;
  deskripsi?: string;
}

interface Brand {
  id: number;
  nama: string;
}

export default function TambahProduk() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    nama: "",
    harga: "",
    merkId: "",
    kategoriId: "",
    barcode: "",
    deskripsi: "",
    stok: "",
    stokMinimal: "5",
    satuan: "pcs",
    hargaBeli: "",
    pajak: "0",
    diskonMaksimal: "0",
    gambar: "",
  });

  const [isProdukFavorit, setIsProdukFavorit] = useState(false);
  const [isAturHargaModal, setIsAturHargaModal] = useState(false);
  const [isStokTidakAktif, setIsStokTidakAktif] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [newVariant, setNewVariant] = useState({ name: "", price: "", stock: "" });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  // Mock brands data (you can replace with API call)
  const brands = [
    { id: 1, nama: "Unilever" },
    { id: 2, nama: "Nestle" },
    { id: 3, nama: "Indofood" },
    { id: 4, nama: "Wings" },
    { id: 5, nama: "Mayora" },
  ];

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
      setLocation("/kelola-produk");
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
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        setFormData(prev => ({ ...prev, gambar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addVariant = () => {
    if (newVariant.name && newVariant.price && newVariant.stock) {
      const variant: ProductVariant = {
        id: Date.now().toString(),
        name: newVariant.name,
        price: parseFloat(newVariant.price),
        stock: parseInt(newVariant.stock),
      };
      setVariants(prev => [...prev, variant]);
      setNewVariant({ name: "", price: "", stock: "" });
      setShowVariantForm(false);
    }
  };

  const removeVariant = (id: string) => {
    setVariants(prev => prev.filter(v => v.id !== id));
  };

  const handleSubmit = () => {
    if (!formData.nama || !formData.harga || !formData.kategoriId) {
      toast({
        title: "Form tidak lengkap",
        description: "Mohon isi nama produk, harga, dan kategori",
        variant: "destructive",
      });
      return;
    }

    const selectedCategory = categories.find(c => c.id.toString() === formData.kategoriId);
    
    const productData = {
      nama: formData.nama,
      kode: formData.barcode || `PRD${Date.now()}`,
      barcode: formData.barcode,
      kategoriId: parseInt(formData.kategoriId),
      kategori: selectedCategory?.nama || "",
      harga: parseFloat(formData.harga),
      hargaBeli: formData.hargaBeli ? parseFloat(formData.hargaBeli) : null,
      stok: parseInt(formData.stok) || 0,
      stokMinimal: parseInt(formData.stokMinimal),
      satuan: formData.satuan,
      deskripsi: formData.deskripsi,
      gambar: formData.gambar,
      pajak: parseFloat(formData.pajak),
      diskonMaksimal: parseFloat(formData.diskonMaksimal),
      isActive: !isStokTidakAktif,
      isProdukFavorit,
      variants: variants.length > 0 ? variants : undefined,
    };

    createProductMutation.mutate(productData);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/kelola-produk")}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Tambah Produk</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Product Image */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="Product"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Camera className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Foto Produk
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <Label htmlFor="nama">Nama Produk</Label>
              <Input
                id="nama"
                placeholder="Masukkan nama produk"
                value={formData.nama}
                onChange={(e) => handleInputChange("nama", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="harga">Harga Jual</Label>
              <Input
                id="harga"
                type="number"
                placeholder="0"
                value={formData.harga}
                onChange={(e) => handleInputChange("harga", e.target.value)}
              />
            </div>

            <div>
              <Label>Merk</Label>
              <Select value={formData.merkId} onValueChange={(value) => handleInputChange("merkId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Merek" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Kategori</Label>
              <Select value={formData.kategoriId} onValueChange={(value) => handleInputChange("kategoriId", value)}>
                <SelectTrigger>
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

            <div>
              <Label htmlFor="barcode">Barcode (Opsional)</Label>
              <Input
                id="barcode"
                placeholder="Scan atau masukkan barcode"
                value={formData.barcode}
                onChange={(e) => handleInputChange("barcode", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                placeholder="Deskripsi produk (opsional)"
                value={formData.deskripsi}
                onChange={(e) => handleInputChange("deskripsi", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Settings */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Produk Favorit</Label>
                <p className="text-xs text-gray-500 mt-1">
                  Tampilkan produk di kategori terdepan.
                </p>
              </div>
              <Switch
                checked={isProdukFavorit}
                onCheckedChange={setIsProdukFavorit}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Atur Harga Modal dan Barcode</Label>
              </div>
              <Switch
                checked={isAturHargaModal}
                onCheckedChange={setIsAturHargaModal}
              />
            </div>

            {isAturHargaModal && (
              <div className="space-y-3 pl-4 border-l-2 border-blue-200">
                <div>
                  <Label htmlFor="hargaBeli">Harga Beli</Label>
                  <Input
                    id="hargaBeli"
                    type="number"
                    placeholder="0"
                    value={formData.hargaBeli}
                    onChange={(e) => handleInputChange("hargaBeli", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="pajak">Pajak (%)</Label>
                  <Input
                    id="pajak"
                    type="number"
                    placeholder="0"
                    value={formData.pajak}
                    onChange={(e) => handleInputChange("pajak", e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Management */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Kelola Stok</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Stok Tidak Aktif</span>
                <Switch
                  checked={isStokTidakAktif}
                  onCheckedChange={setIsStokTidakAktif}
                />
              </div>
            </div>

            {!isStokTidakAktif && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="stok">Stok Awal</Label>
                  <Input
                    id="stok"
                    type="number"
                    placeholder="0"
                    value={formData.stok}
                    onChange={(e) => handleInputChange("stok", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="stokMinimal">Stok Minimal</Label>
                  <Input
                    id="stokMinimal"
                    type="number"
                    placeholder="5"
                    value={formData.stokMinimal}
                    onChange={(e) => handleInputChange("stokMinimal", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="satuan">Satuan</Label>
                  <Select value={formData.satuan} onValueChange={(value) => handleInputChange("satuan", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">Pcs</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="gram">Gram</SelectItem>
                      <SelectItem value="liter">Liter</SelectItem>
                      <SelectItem value="ml">ML</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                      <SelectItem value="pack">Pack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wholesale Pricing */}
        <Card>
          <CardContent className="p-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-yellow-800">Atur Harga Grosir</h3>
                  <p className="text-sm text-yellow-600 mt-1">
                    Kamu akan lebih leluasa mengatur harga grosir sesuai keinginanmu.
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-yellow-700">
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Variants */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Varian Produk</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {variants.map((variant) => (
              <div key={variant.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div>
                  <p className="font-medium">{variant.name}</p>
                  <p className="text-sm text-gray-500">
                    Rp {variant.price.toLocaleString()} • Stok: {variant.stock}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVariant(variant.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {showVariantForm ? (
              <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                <Input
                  placeholder="Nama varian (contoh: Ukuran L, Warna Merah)"
                  value={newVariant.name}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, name: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Harga"
                    value={newVariant.price}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, price: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Stok"
                    value={newVariant.stock}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, stock: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addVariant} size="sm" className="flex-1">
                    Tambah Varian
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowVariantForm(false)}
                    size="sm"
                  >
                    Batal
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowVariantForm(true)}
                className="w-full border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Varian
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-6">
        <Button
          onClick={handleSubmit}
          disabled={createProductMutation.isPending}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 text-base font-medium"
        >
          {createProductMutation.isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
