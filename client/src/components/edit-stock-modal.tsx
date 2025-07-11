import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Edit, Minus, Plus } from "lucide-react";

interface EditStockModalProps {
  product: {
    id: number;
    nama: string;
    stok: number;
  };
  onUpdateStock: (productId: number, newStock: number) => Promise<void>;
  trigger?: React.ReactNode;
}

export function EditStockModal({ product, onUpdateStock, trigger }: EditStockModalProps) {
  const [open, setOpen] = useState(false);
  const [newStock, setNewStock] = useState(product.stok);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onUpdateStock(product.id, newStock);
      setOpen(false);
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Gagal mengubah stok. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const adjustStock = (amount: number) => {
    const newValue = Math.max(0, newStock + amount);
    setNewStock(newValue);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setNewStock(product.stok);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="shrink-0">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Stok Produk</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Produk</Label>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="font-medium text-gray-900">{product.nama}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Stok Saat Ini</Label>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="font-medium text-gray-600">{product.stok} unit</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newStock">Stok Baru</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => adjustStock(-1)}
                disabled={newStock <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="newStock"
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(Math.max(0, parseInt(e.target.value) || 0))}
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
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)} 
              className="flex-1"
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-red-500 hover:bg-red-600"
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
