import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { X, Minus, Plus } from "lucide-react";

interface Product {
  id: number;
  nama: string;
  harga: number;
  hargaBeli?: number;
  stok: number;
  kategori: string;
  deskripsi?: string;
  satuan?: string;
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (productId: number, updatedData: Partial<Product>) => Promise<void>;
  isLoading?: boolean;
}

export function EditProductModal({
  isOpen,
  onClose,
  product,
  onSave,
  isLoading = false
}: EditProductModalProps) {
  const [formData, setFormData] = useState({
    nama: "",
    harga: 0,
    hargaBeli: 0,
    stok: 0,
    deskripsi: "",
    satuan: "pcs"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        nama: product.nama || "",
        harga: product.harga || 0,
        hargaBeli: product.hargaBeli || 0,
        stok: product.stok || 0,
        deskripsi: product.deskripsi || "",
        satuan: product.satuan || "pcs"
      });
      setErrors({});
    }
  }, [product]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama.trim()) {
      newErrors.nama = "Nama produk wajib diisi";
    }

    if (formData.harga <= 0) {
      newErrors.harga = "Harga jual harus lebih dari 0";
    }

    if (formData.hargaBeli < 0) {
      newErrors.hargaBeli = "Harga modal tidak boleh negatif";
    }

    if (formData.hargaBeli > 0 && formData.harga <= formData.hargaBeli) {
      newErrors.harga = "Harga jual harus lebih tinggi dari harga modal";
    }

    if (formData.stok < 0) {
      newErrors.stok = "Stok tidak boleh negatif";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !validateForm()) return;

    try {
      await onSave(product.id, formData);
      onClose();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const adjustStock = (delta: number) => {
    const newStock = Math.max(0, formData.stok + delta);
    handleInputChange("stok", newStock);
  };

  const calculateProfit = () => {
    if (formData.harga > 0 && formData.hargaBeli > 0) {
      const profit = formData.harga - formData.hargaBeli;
      const profitPercentage = (profit / formData.hargaBeli) * 100;
      return { profit, profitPercentage };
    }
    return { profit: 0, profitPercentage: 0 };
  };

  const { profit, profitPercentage } = calculateProfit();

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Produk</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Produk */}
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Produk</Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => handleInputChange("nama", e.target.value)}
              placeholder="Masukkan nama produk"
              className={errors.nama ? "border-red-500" : ""}
            />
            {errors.nama && (
              <p className="text-sm text-red-500">{errors.nama}</p>
            )}
          </div>

          {/* Harga Modal */}
          <div className="space-y-2">
            <Label htmlFor="hargaBeli">Harga Modal (Beli)</Label>
            <Input
              id="hargaBeli"
              type="number"
              value={formData.hargaBeli}
              onChange={(e) => handleInputChange("hargaBeli", parseFloat(e.target.value) || 0)}
              placeholder="0"
              min="0"
              step="0.01"
              className={errors.hargaBeli ? "border-red-500" : ""}
            />
            {errors.hargaBeli && (
              <p className="text-sm text-red-500">{errors.hargaBeli}</p>
            )}
          </div>

          {/* Harga Jual */}
          <div className="space-y-2">
            <Label htmlFor="harga">Harga Jual</Label>
            <Input
              id="harga"
              type="number"
              value={formData.harga}
              onChange={(e) => handleInputChange("harga", parseFloat(e.target.value) || 0)}
              placeholder="0"
              min="0"
              step="0.01"
              className={errors.harga ? "border-red-500" : ""}
            />
            {errors.harga && (
              <p className="text-sm text-red-500">{errors.harga}</p>
            )}
          </div>

          {/* Profit Calculation */}
          {formData.harga > 0 && formData.hargaBeli > 0 && (
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>Keuntungan:</span>
                  <span className="font-semibold text-green-600">
                    Rp{profit.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Margin:</span>
                  <span className="font-semibold text-green-600">
                    {profitPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Stok */}
          <div className="space-y-2">
            <Label>Stok Saat Ini</Label>
            <div className="text-sm text-gray-600 mb-2">
              {product.stok} {product.satuan || 'pcs'}
            </div>
            
            <Label>Stok Baru</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => adjustStock(-1)}
                disabled={formData.stok <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <Input
                type="number"
                value={formData.stok}
                onChange={(e) => handleInputChange("stok", parseInt(e.target.value) || 0)}
                className="text-center"
                min="0"
              />
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => adjustStock(1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.stok && (
              <p className="text-sm text-red-500">{errors.stok}</p>
            )}
          </div>

          {/* Satuan */}
          <div className="space-y-2">
            <Label htmlFor="satuan">Satuan</Label>
            <Input
              id="satuan"
              value={formData.satuan}
              onChange={(e) => handleInputChange("satuan", e.target.value)}
              placeholder="pcs, kg, liter, dll"
            />
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi (Opsional)</Label>
            <Textarea
              id="deskripsi"
              value={formData.deskripsi}
              onChange={(e) => handleInputChange("deskripsi", e.target.value)}
              placeholder="Deskripsi produk..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
