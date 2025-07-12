import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Plus } from "lucide-react";

interface AddCategoryModalProps {
  onAddCategory: (category: any) => void;
  trigger?: React.ReactNode;
}

export function AddCategoryModal({ onAddCategory, trigger }: AddCategoryModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    warna: "#ef4444", // Default red color
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Call the parent's onAddCategory function with the form data
      // The parent will handle the API call and cache management
      await onAddCategory({
        nama: formData.nama,
        deskripsi: formData.deskripsi,
        warna: formData.warna,
        is_active: true
      });
      
      // Close modal and reset form on success
      setOpen(false);
      setFormData({
        nama: "",
        deskripsi: "",
        warna: "#ef4444",
      });
    } catch (error: any) {
      console.error('Add category error:', error);
      // You can add toast notification here
      alert(`Error: ${error.message}`);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const colorOptions = [
    { value: "#ef4444", label: "Merah", color: "bg-red-500" },
    { value: "#3b82f6", label: "Biru", color: "bg-blue-500" },
    { value: "#10b981", label: "Hijau", color: "bg-green-500" },
    { value: "#f59e0b", label: "Kuning", color: "bg-yellow-500" },
    { value: "#8b5cf6", label: "Ungu", color: "bg-purple-500" },
    { value: "#06b6d4", label: "Cyan", color: "bg-cyan-500" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kategori
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Kategori Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Kategori *</Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => handleInputChange("nama", e.target.value)}
              placeholder="Masukkan nama kategori"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              value={formData.deskripsi}
              onChange={(e) => handleInputChange("deskripsi", e.target.value)}
              placeholder="Deskripsi kategori (opsional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Warna Kategori</Label>
            <div className="grid grid-cols-3 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleInputChange("warna", color.value)}
                  className={`p-3 rounded-lg border-2 flex items-center gap-2 ${
                    formData.warna === color.value 
                      ? "border-gray-900 bg-gray-50" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${color.color}`}></div>
                  <span className="text-sm">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Batal
            </Button>
            <Button type="submit" className="flex-1 bg-red-500 hover:bg-red-600">
              Simpan Kategori
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
