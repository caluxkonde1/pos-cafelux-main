import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Plus, Upload } from "lucide-react";

interface AddProductModalProps {
  onAddProduct: (product: any) => void;
  trigger?: React.ReactNode;
}

export function AddProductModal({ onAddProduct, trigger }: AddProductModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    harga: "",
    stok: "",
    kategori: "",
    deskripsi: "",
    barcode: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProduct = {
      id: Date.now(),
      nama: formData.nama,
      harga: parseInt(formData.harga),
      stok: formData.stok ? parseInt(formData.stok) : null,
      kategori: formData.kategori,
      avatar: formData.nama.substring(0, 2).toUpperCase(),
      deskripsi: formData.deskripsi,
      barcode: formData.barcode,
    };

    onAddProduct(newProduct);
    setOpen(false);
    setFormData({
      nama: "",
      harga: "",
      stok: "",
      kategori: "",
      deskripsi: "",
      barcode: "",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 shadow-lg">
            <Plus className="h-6 w-6 text-white" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Produk Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Produk *</Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => handleInputChange("nama", e.target.value)}
              placeholder="Masukkan nama produk"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="harga">Harga *</Label>
            <Input
              id="harga"
              type="number"
              value={formData.harga}
              onChange={(e) => handleInputChange("harga", e.target.value)}
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stok">Stok</Label>
            <Input
              id="stok"
              type="number"
              value={formData.stok}
              onChange={(e) => handleInputChange("stok", e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kategori">Kategori</Label>
            <Select value={formData.kategori} onValueChange={(value) => handleInputChange("kategori", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Produk">Produk</SelectItem>
                <SelectItem value="Minuman">Minuman</SelectItem>
                <SelectItem value="Makanan">Makanan</SelectItem>
                <SelectItem value="Elektronik">Elektronik</SelectItem>
                <SelectItem value="Aksesoris">Aksesoris</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode</Label>
            <Input
              id="barcode"
              value={formData.barcode}
              onChange={(e) => handleInputChange("barcode", e.target.value)}
              placeholder="Scan atau masukkan barcode"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              value={formData.deskripsi}
              onChange={(e) => handleInputChange("deskripsi", e.target.value)}
              placeholder="Deskripsi produk (opsional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Foto Produk</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Klik untuk upload foto</p>
              <p className="text-xs text-gray-400">PNG, JPG hingga 5MB</p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Batal
            </Button>
            <Button type="submit" className="flex-1 bg-red-500 hover:bg-red-600">
              Simpan Produk
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
